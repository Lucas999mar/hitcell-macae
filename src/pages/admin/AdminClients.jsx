import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminClients() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [cOrders, setCOrders] = useState([]);
    const [cServices, setCServices] = useState([]);
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() { setCustomers(await db.getAll('customers')); }

    async function viewCustomer(c) {
        setSelected(c);
        const [orders, services] = await Promise.all([
            db.query('orders', o => o.customer_id === c.id || o.customer_email === c.email),
            db.query('service_orders', s => s.customer_phone === c.phone)
        ]);
        setCOrders(orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setCServices(services);
    }

    const filtered = customers.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
    const totalSpent = (cid) => {
        // Quick calculate
        return 0;
    };

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>👥 Clientes ({customers.length})</h1>
                <input type="text" className="form-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 250 }} />
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Desde</th><th>LGPD</th><th>Ações</th></tr></thead>
                    <tbody>{filtered.map(c => (
                        <tr key={c.id}>
                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                            <td style={{ fontSize: '0.85rem' }}>{c.email}</td>
                            <td style={{ fontSize: '0.85rem' }}>{c.phone}</td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                            <td><span className={`badge ${c.privacy_consent ? 'badge-green' : 'badge-red'}`}>{c.privacy_consent ? 'Aceito' : 'Pendente'}</span></td>
                            <td><button className="btn btn-ghost btn-sm" onClick={() => viewCustomer(c)}>👁️ Ver</button></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">Cliente: {selected.name}</h3><button className="modal-close" onClick={() => setSelected(null)}>✕</button></div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: '0.9rem' }}>
                                <div><span style={{ color: 'var(--gray-500)' }}>E-mail:</span> {selected.email}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>Telefone:</span> {selected.phone}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>WhatsApp:</span> {selected.whatsapp}</div>
                                <div><span style={{ color: 'var(--gray-500)' }}>CPF:</span> {selected.document || '—'}</div>
                            </div>
                            <h4 style={{ fontWeight: 700, marginBottom: 12 }}>🛒 Pedidos ({cOrders.length})</h4>
                            {cOrders.length === 0 ? <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>Nenhum pedido</p> :
                                cOrders.map(o => (
                                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>{o.number}</span>
                                        <span>R$ {o.total?.toFixed(2)}</span>
                                        <span className="badge badge-green">{o.status}</span>
                                    </div>
                                ))
                            }
                            <h4 style={{ fontWeight: 700, marginTop: 20, marginBottom: 12 }}>🔧 Serviços ({cServices.length})</h4>
                            {cServices.length === 0 ? <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>Nenhum serviço</p> :
                                cServices.map(s => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>{s.number}</span>
                                        <span>{s.device_brand} {s.device_model}</span>
                                        <span>{s.total ? `R$ ${s.total.toFixed(2)}` : '—'}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
