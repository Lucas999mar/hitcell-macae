import { useState } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function TrackService() {
    const [query, setQuery] = useState('');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const toast = useToast();

    async function handleSearch(e) {
        e.preventDefault();
        if (!query && !phone) { toast.error('Informe o número ou telefone'); return; }
        let results = [];
        if (query) results = await db.query('service_orders', o => o.number?.toUpperCase() === query.toUpperCase());
        if (results.length === 0 && phone) results = await db.query('service_orders', o => o.customer_phone?.includes(phone.replace(/\D/g, '')));
        if (results.length > 0) { setOrder(results[0]); setNotFound(false); }
        else { setOrder(null); setNotFound(true); }
    }

    const statusLabels = {
        received: { label: 'Solicitação Recebida', color: 'blue', icon: '📩' },
        device_received: { label: 'Aparelho Recebido', color: 'blue', icon: '📱' },
        evaluating: { label: 'Em Avaliação', color: 'yellow', icon: '🔍' },
        quote_sent: { label: 'Orçamento Enviado', color: 'orange', icon: '📋' },
        waiting_approval: { label: 'Aguardando Aprovação', color: 'yellow', icon: '⏳' },
        approved: { label: 'Orçamento Aprovado', color: 'green', icon: '✅' },
        in_repair: { label: 'Em Manutenção', color: 'blue', icon: '🔧' },
        waiting_parts: { label: 'Aguardando Peça', color: 'orange', icon: '📦' },
        completed: { label: 'Serviço Concluído', color: 'green', icon: '✅' },
        ready_pickup: { label: 'Pronto para Retirada', color: 'green', icon: '🏪' },
        delivered: { label: 'Entregue', color: 'green', icon: '📱' },
        cancelled: { label: 'Cancelado', color: 'red', icon: '❌' },
    };

    const st = statusLabels[order?.status] || { label: order?.status, color: 'gray', icon: '📋' };

    return (
        <div className="container" style={{ maxWidth: 600, padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔧</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Acompanhar Serviço</h1>
                <p style={{ color: 'var(--gray-400)', marginTop: 8 }}>Consulte o status do seu reparo</p>
            </div>

            <form onSubmit={handleSearch} className="card" style={{ padding: 24, marginBottom: 24 }}>
                <div className="form-group">
                    <label className="form-label">Número da Ordem de Serviço</label>
                    <input type="text" className="form-input" placeholder="Ex: OS-001" value={query} onChange={e => setQuery(e.target.value)} />
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
                    <p style={{ fontWeight: 600 }}>Serviço não encontrado</p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>Verifique as informações e tente novamente.</p>
                </div>
            )}

            {order && (
                <div className="card animate-slide" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>Ordem de Serviço</p>
                            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--red)' }}>{order.number}</p>
                        </div>
                        <span className={`badge badge-${st.color}`}>{st.icon} {st.label}</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--gray-800)', paddingTop: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
                            <div><span style={{ color: 'var(--gray-500)' }}>Aparelho:</span><br />{order.device_brand} {order.device_model}</div>
                            <div><span style={{ color: 'var(--gray-500)' }}>Problema:</span><br />{order.problem}</div>
                            {order.diagnosis && <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--gray-500)' }}>Diagnóstico:</span><br />{order.diagnosis}</div>}
                            {order.total && <div><span style={{ color: 'var(--gray-500)' }}>Valor:</span><br />R$ {order.total.toFixed(2)}</div>}
                            {order.warranty && <div><span style={{ color: 'var(--gray-500)' }}>Garantia:</span><br />{order.warranty}</div>}
                        </div>
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
