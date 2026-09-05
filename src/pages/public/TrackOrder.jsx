import { useState } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function TrackOrder() {
    const [query, setQuery] = useState('');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const toast = useToast();

    async function handleSearch(e) {
        e.preventDefault();
        if (!query) { toast.error('Informe o número do pedido'); return; }
        const orders = await db.query('orders', o => o.number?.toUpperCase() === query.toUpperCase());
        if (orders.length > 0 && (!phone || orders[0].customer_phone?.includes(phone.replace(/\D/g, '')))) {
            setOrder(orders[0]); setNotFound(false);
        } else { setOrder(null); setNotFound(true); }
    }

    const statusLabels = {
        pending_payment: { label: 'Aguardando Pagamento', color: 'yellow', icon: '⏳' },
        payment_analysis: { label: 'Pagamento em Análise', color: 'blue', icon: '🔍' },
        paid: { label: 'Pago', color: 'green', icon: '✅' },
        separating: { label: 'Em Separação', color: 'blue', icon: '📦' },
        ready_pickup: { label: 'Pronto para Retirada', color: 'green', icon: '🏪' },
        shipped: { label: 'Enviado', color: 'blue', icon: '🚚' },
        delivered: { label: 'Entregue', color: 'green', icon: '✅' },
        cancelled: { label: 'Cancelado', color: 'red', icon: '❌' },
        refunded: { label: 'Reembolsado', color: 'orange', icon: '↩️' },
    };

    const st = statusLabels[order?.status] || { label: order?.status, color: 'gray', icon: '📋' };

    return (
        <div className="container" style={{ maxWidth: 600, padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Acompanhar Pedido</h1>
                <p style={{ color: 'var(--gray-400)', marginTop: 8 }}>Consulte o status da sua compra</p>
            </div>

            <form onSubmit={handleSearch} className="card" style={{ padding: 24, marginBottom: 24 }}>
                <div className="form-group">
                    <label className="form-label">Número do Pedido</label>
                    <input type="text" className="form-input" placeholder="Ex: HC..." value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Telefone (para verificação)</label>
                    <input type="tel" className="form-input" placeholder="(22) 99999-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Consultar</button>
            </form>

            {notFound && (
                <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: 8 }}>❌</p>
                    <p style={{ fontWeight: 600 }}>Pedido não encontrado</p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginTop: 4 }}>Verifique o número e tente novamente.</p>
                </div>
            )}

            {order && (
                <div className="card animate-slide" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>Pedido</p>
                            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--red)' }}>{order.number}</p>
                        </div>
                        <span className={`badge badge-${st.color}`}>{st.icon} {st.label}</span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--gray-800)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--gray-400)' }}>Data</span>
                            <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--gray-400)' }}>Total</span>
                            <span style={{ fontWeight: 700 }}>R$ {order.total?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--gray-400)' }}>Entrega</span>
                            <span>{order.delivery_type === 'pickup' ? 'Retirada na Loja' : 'Entrega'}</span>
                        </div>
                        {order.items?.map((item, i) => (
                            <div key={i} style={{ padding: '8px 0', borderTop: '1px solid var(--gray-800)', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-300)' }}>{item.quantity}x {item.name}</span>
                                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {order.history && (
                        <div style={{ marginTop: 20, borderTop: '1px solid var(--gray-800)', paddingTop: 16 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Histórico</h4>
                            {order.history.map((h, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{new Date(h.date).toLocaleString('pt-BR')}</span>
                                    <span style={{ color: 'var(--gray-300)' }}>{h.action}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
