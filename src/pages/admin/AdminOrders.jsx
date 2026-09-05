import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

const statusLabels = {
    pending_payment: { l: 'Aguardando Pagamento', c: 'yellow' }, payment_analysis: { l: 'Em Análise', c: 'blue' },
    paid: { l: 'Pago', c: 'green' }, separating: { l: 'Em Separação', c: 'blue' },
    ready_pickup: { l: 'Pronto Retirada', c: 'green' }, shipped: { l: 'Enviado', c: 'blue' },
    delivered: { l: 'Entregue', c: 'green' }, cancelled: { l: 'Cancelado', c: 'red' }, refunded: { l: 'Reembolsado', c: 'orange' }
};
const statusOptions = Object.entries(statusLabels).map(([k, v]) => ({ value: k, label: v.l }));

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() { const o = await db.getAll('orders'); setOrders(o.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))); }

    async function updateStatus(order, newStatus) {
        const history = [...(order.history || []), { action: `Status alterado para: ${statusLabels[newStatus]?.l || newStatus}`, date: new Date().toISOString(), by: 'admin' }];
        await db.put('orders', { ...order, status: newStatus, history });

        if (newStatus === 'cancelled' || newStatus === 'refunded') {
            for (const item of (order.items || [])) {
                const prod = await db.getById('products', item.product_id);
                if (prod) {
                    await db.put('products', { ...prod, stock: prod.stock + item.quantity });
                    await db.put('inventory_movements', { product_id: item.product_id, product_name: prod.name, type: newStatus === 'refunded' ? 'refund_return' : 'cancel_return', quantity: item.quantity, stock_before: prod.stock, stock_after: prod.stock + item.quantity, reason: `${newStatus === 'refunded' ? 'Reembolso' : 'Cancelamento'} do pedido ${order.number}`, order_id: order.id, employee_id: 'admin' });
                }
            }
            if (newStatus === 'refunded') {
                await db.put('revenues', { order_id: order.id, type: 'refund', amount: -(order.total || 0), description: `Reembolso pedido ${order.number}` });
            }
        }
        if (newStatus === 'paid') {
            await db.put('revenues', { order_id: order.id, type: 'sale', amount: order.total || 0, description: `Venda pedido ${order.number}`, channel: order.channel });
        }

        await db.put('audit_log', { user_id: 'admin', action: 'order_status_change', entity_type: 'order', entity_id: order.id, details: `Pedido ${order.number}: ${newStatus}` });
        toast.success('Status atualizado!');
        load();
        if (selected?.id === order.id) setSelected({ ...order, status: newStatus, history });
    }

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🛒 Pedidos ({orders.length})</h1>
                <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 220 }}>
                    <option value="all">Todos</option>
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        {filtered.map(o => {
                            const st = statusLabels[o.status] || { l: o.status, c: 'gray' };
                            return (
                                <tr key={o.id}>
                                    <td><span style={{ fontWeight: 700, color: 'var(--red)' }}>{o.number}</span><br /><span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{o.channel === 'pos' ? '🏪 Balcão' : '🌐 Site'}</span></td>
                                    <td style={{ fontSize: '0.88rem' }}>{o.customer_name}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ fontWeight: 700 }}>R$ {o.total?.toFixed(2)}</td>
                                    <td style={{ fontSize: '0.85rem' }}>{o.payment_method === 'pix' ? '📱 Pix' : o.payment_method === 'credit_card' ? '💳 Crédito' : o.payment_method === 'cash' ? '💵 Dinheiro' : o.payment_method}</td>
                                    <td><span className={`badge badge-${st.c}`}>{st.l}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-icon-sm" onClick={() => setSelected(o)} title="Detalhes">👁️</button>
                                            <select className="form-select" value={o.status} onChange={e => updateStatus(o, e.target.value)} style={{ width: 160, padding: '6px 8px', fontSize: '0.78rem' }}>
                                                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Pedido {selected.number}</h3>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: '0.9rem' }}>
                                <div><span style={{ color: 'var(--gray-500)' }}>Cliente:</span> {selected.customer_name}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>E-mail:</span> {selected.customer_email}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>Telefone:</span> {selected.customer_phone}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>Canal:</span> {selected.channel === 'pos' ? 'Balcão' : 'Site'}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>Entrega:</span> {selected.delivery_type === 'pickup' ? 'Retirada' : 'Entrega'}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>Pagamento:</span> {selected.payment_method}</div>
                            </div>
                            <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Itens</h4>
                            {selected.items?.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                                    <span>{item.quantity}x {item.name} {item.variation ? `(${item.variation})` : ''}</span>
                                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 800, fontSize: '1.1rem' }}>Total: R$ {selected.total?.toFixed(2)}</div>
                            {selected.history && (
                                <div style={{ marginTop: 20 }}><h4 style={{ fontWeight: 700, marginBottom: 12 }}>Histórico</h4>
                                    {selected.history.map((h, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: '0.82rem' }}>
                                            <span style={{ color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{new Date(h.date).toLocaleString('pt-BR')}</span>
                                            <span>{h.action}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
