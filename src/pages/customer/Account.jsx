import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function Account() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!user) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return null;
    }

    useEffect(() => { loadData(); }, [user]);

    async function loadData() {
        const [o, s] = await Promise.all([
            db.query('orders', o => o.customer_id === user.id || o.customer_email === user.email),
            db.query('service_orders', s => s.customer_phone === user.phone)
        ]);
        setOrders(o.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setServices(s.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setLoading(false);
    }

    const orderStatusLabels = {
        pending_payment: { l: 'Aguardando Pagamento', c: 'yellow' },
        paid: { l: 'Pago', c: 'green' },
        separating: { l: 'Em Separação', c: 'blue' },
        ready_pickup: { l: 'Pronto Retirada', c: 'green' },
        shipped: { l: 'Enviado', c: 'blue' },
        delivered: { l: 'Entregue', c: 'green' },
        cancelled: { l: 'Cancelado', c: 'red' }
    };

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;

    return (
        <div className="container" style={{ padding: '40px 20px 80px', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, flexWrap: 'wrap', gap: 20 }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Minha Conta</h1>
                    <p style={{ color: 'var(--gray-400)', marginTop: 4 }}>Olá, <span style={{ color: 'var(--white)', fontWeight: 600 }}>{user.name}</span></p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={logout}>🚪 Sair da conta</button>
            </div>

            <div className="tabs" style={{ marginBottom: 30 }}>
                <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>📦 Meus Pedidos ({orders.length})</button>
                <button className={`tab ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>🔧 Assistência ({services.length})</button>
                <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>👤 Perfil</button>
            </div>

            {tab === 'orders' && (
                <div>
                    {orders.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">🛒</div><p className="empty-state-title">Nenhum pedido</p><p style={{ color: 'var(--gray-400)' }}>Você ainda não fez nenhuma compra conosco.</p></div>
                    ) : (
                        orders.map(o => {
                            const st = orderStatusLabels[o.status] || { l: o.status, c: 'gray' };
                            return (
                                <div key={o.id} className="card" style={{ padding: 24, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-800)', paddingBottom: 16, marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                        <div>
                                            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Pedido </span>
                                            <span style={{ fontWeight: 700, color: 'var(--red)' }}>{o.number}</span>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: 4 }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</div>
                                        </div>
                                        <div><span className={`badge badge-${st.c}`}>{st.l}</span></div>
                                    </div>
                                    {o.items?.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.88rem' }}>
                                            <span style={{ color: 'var(--gray-300)' }}>{item.quantity}x {item.name}</span>
                                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{o.delivery_type === 'pickup' ? 'Retirada na Loja' : 'Entrega a Domicílio'}</span>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total: R$ {o.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {tab === 'services' && (
                <div>
                    {services.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">🔧</div><p className="empty-state-title">Nenhum serviço</p><p style={{ color: 'var(--gray-400)' }}>Você não possui histórico de assistência conosco.</p></div>
                    ) : (
                        services.map(s => (
                            <div key={s.id} className="card" style={{ padding: 24, marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-800)', paddingBottom: 16, marginBottom: 16 }}>
                                    <div>
                                        <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Ordem de Serviço </span>
                                        <span style={{ fontWeight: 700, color: 'var(--red)' }}>{s.number}</span>
                                    </div>
                                    <div><span className="badge badge-blue">{s.status.replace('_', ' ').toUpperCase()}</span></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
                                    <div><span style={{ color: 'var(--gray-500)' }}>Aparelho:</span> {s.device_brand} {s.device_model}</div>
                                    <div><span style={{ color: 'var(--gray-500)' }}>Problema:</span> {s.problem}</div>
                                    {s.total && <div><span style={{ color: 'var(--gray-500)' }}>Valor do Serviço:</span> R$ {s.total.toFixed(2)}</div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'profile' && (
                <div className="card" style={{ padding: 32 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Dados Pessoais</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.95rem' }}>
                        <div><span style={{ color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Nome Completo</span><span style={{ fontWeight: 600 }}>{user.name}</span></div>
                        <div><span style={{ color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>E-mail</span><span>{user.email}</span></div>
                        <div><span style={{ color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Telefone / WhatsApp</span><span>{user.phone || 'Não informado'}</span></div>
                        <div><span style={{ color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>LGPD / Privacidade</span><span style={{ color: 'var(--green)' }}>Termo Aceito</span></div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 24 }}>Editar Dados (Em breve)</button>
                </div>
            )}
        </div>
    );
}
