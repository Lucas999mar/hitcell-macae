import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

const soStatusLabels = { received: { l: 'Recebida', c: 'blue' }, device_received: { l: 'Aparelho Recebido', c: 'blue' }, evaluating: { l: 'Em Avaliação', c: 'yellow' }, quote_sent: { l: 'Orçamento Enviado', c: 'orange' }, waiting_approval: { l: 'Aguardando Aprovação', c: 'yellow' }, approved: { l: 'Aprovado', c: 'green' }, in_repair: { l: 'Em Manutenção', c: 'blue' }, waiting_parts: { l: 'Aguardando Peça', c: 'orange' }, completed: { l: 'Concluído', c: 'green' }, ready_pickup: { l: 'Pronto Retirada', c: 'green' }, delivered: { l: 'Entregue', c: 'green' }, cancelled: { l: 'Cancelado', c: 'red' } };

export default function AdminService() {
    const [requests, setRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState('requests');
    const [selected, setSelected] = useState(null);
    const [showSOForm, setShowSOForm] = useState(false);
    const [soForm, setSOForm] = useState({});
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        const [req, so] = await Promise.all([db.getAll('service_requests'), db.getAll('service_orders')]);
        setRequests(req.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setOrders(so.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }

    async function convertToSO(req) {
        const num = `OS${String(orders.length + 1).padStart(4, '0')}`;
        setSOForm({
            number: num, customer_name: req.name, customer_phone: req.phone, customer_email: req.email,
            device_brand: req.brand, device_model: req.model, problem: req.problem,
            accessories: '', physical_condition: '', diagnosis: '', service_performed: '',
            parts_used: [], parts_cost: 0, labor_cost: 0, discount: 0, total: 0,
            warranty: '90 dias', status: 'device_received', payment_status: 'pending', payment_method: '',
            technician: '', deadline: '', notes: req.notes || '',
            request_id: req.id,
            history: [
                ...(req.history || []),
                { action: `Convertida em Ordem de Serviço ${num}`, date: new Date().toISOString(), by: 'admin' }
            ]
        });
        setShowSOForm(true);
    }

    async function saveSO() {
        if (!soForm.customer_name || !soForm.device_brand) { toast.error('Preencha os dados obrigatórios'); return; }
        const total = (parseFloat(soForm.parts_cost) || 0) + (parseFloat(soForm.labor_cost) || 0) - (parseFloat(soForm.discount) || 0);
        const data = { ...soForm, total, parts_cost: parseFloat(soForm.parts_cost) || 0, labor_cost: parseFloat(soForm.labor_cost) || 0, discount: parseFloat(soForm.discount) || 0 };
        if (!data.number) data.number = `OS${String(orders.length + 1).padStart(4, '0')}`;
        await db.put('service_orders', data);
        if (soForm.request_id) await db.put('service_requests', { ...(requests.find(r => r.id === soForm.request_id)), status: 'converted' });
        await db.put('audit_log', { user_id: 'admin', action: 'service_order', entity_type: 'service_order', details: `O.S. ${data.number}` });
        toast.success('Ordem de Serviço salva!');
        setShowSOForm(false);
        load();
    }

    async function updateSOStatus(so, newStatus) {
        const history = [...(so.history || []), { action: `Status: ${soStatusLabels[newStatus]?.l || newStatus}`, date: new Date().toISOString(), by: 'admin' }];
        await db.put('service_orders', { ...so, status: newStatus, history });

        if (newStatus === 'completed' && so.total > 0 && so.payment_status === 'approved') {
            await db.put('revenues', { type: 'service', amount: so.total, description: `Serviço ${so.number}`, source: 'service' });
        }
        toast.success('Status atualizado!');
        load();
    }

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>🔧 Assistência Técnica</h1>

            <div className="tabs" style={{ marginBottom: 24 }}>
                <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>📩 Solicitações ({requests.length})</button>
                <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>📋 Ordens de Serviço ({orders.length})</button>
            </div>

            {tab === 'requests' && (
                <div>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Data</th><th>Cliente</th><th>Aparelho</th><th>Problema</th><th>Contato</th><th>Ações</th></tr></thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontSize: '0.85rem' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{r.phone}</div></td>
                                        <td style={{ fontSize: '0.85rem' }}>{r.brand} {r.model}</td>
                                        <td style={{ fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.problem}</td>
                                        <td style={{ fontSize: '0.82rem' }}>{r.contact_preference}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-primary btn-sm" onClick={() => convertToSO(r)}>Criar O.S.</button>
                                                <a href={`https://wa.me/55${r.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">💬</a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {requests.length === 0 && <div className="empty-state"><div className="empty-state-icon">📩</div><p className="empty-state-title">Nenhuma solicitação</p></div>}
                </div>
            )}

            {tab === 'orders' && (
                <div>
                    <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => { setSOForm({ number: `OS${String(orders.length + 1).padStart(4, '0')}`, status: 'device_received', warranty: '90 dias', history: [{ action: 'O.S. criada', date: new Date().toISOString(), by: 'admin' }] }); setShowSOForm(true); }}>
                        + Nova Ordem de Serviço
                    </button>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Número</th><th>Cliente</th><th>Aparelho</th><th>Problema</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
                            <tbody>
                                {orders.map(o => {
                                    const st = soStatusLabels[o.status] || { l: o.status, c: 'gray' };
                                    return (
                                        <tr key={o.id}>
                                            <td style={{ fontWeight: 700, color: 'var(--red)' }}>{o.number}</td>
                                            <td><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.customer_name}</div></td>
                                            <td style={{ fontSize: '0.85rem' }}>{o.device_brand} {o.device_model}</td>
                                            <td style={{ fontSize: '0.85rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.problem}</td>
                                            <td style={{ fontWeight: 600 }}>{o.total ? `R$ ${o.total.toFixed(2)}` : '—'}</td>
                                            <td><span className={`badge badge-${st.c}`}>{st.l}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-ghost btn-icon-sm" onClick={() => { setSOForm(o); setShowSOForm(true); }}>✏️</button>
                                                    <select className="form-select" value={o.status} onChange={e => updateSOStatus(o, e.target.value)} style={{ width: 140, padding: '4px 6px', fontSize: '0.75rem' }}>
                                                        {Object.entries(soStatusLabels).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SO Form Modal */}
            {showSOForm && (
                <div className="modal-overlay" onClick={() => setShowSOForm(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflow: 'auto' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Ordem de Serviço - {soForm.number}</h3>
                            <button className="modal-close" onClick={() => setShowSOForm(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Cliente *</label><input type="text" className="form-input" value={soForm.customer_name || ''} onChange={e => setSOForm({ ...soForm, customer_name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Telefone</label><input type="tel" className="form-input" value={soForm.customer_phone || ''} onChange={e => setSOForm({ ...soForm, customer_phone: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Marca *</label><input type="text" className="form-input" value={soForm.device_brand || ''} onChange={e => setSOForm({ ...soForm, device_brand: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Modelo *</label><input type="text" className="form-input" value={soForm.device_model || ''} onChange={e => setSOForm({ ...soForm, device_model: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Problema</label><textarea className="form-textarea" value={soForm.problem || ''} onChange={e => setSOForm({ ...soForm, problem: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Diagnóstico</label><textarea className="form-textarea" value={soForm.diagnosis || ''} onChange={e => setSOForm({ ...soForm, diagnosis: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Serviço Realizado</label><textarea className="form-textarea" value={soForm.service_performed || ''} onChange={e => setSOForm({ ...soForm, service_performed: e.target.value })} /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Valor Peças (R$)</label><input type="number" step="0.01" className="form-input" value={soForm.parts_cost || 0} onChange={e => setSOForm({ ...soForm, parts_cost: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Mão de Obra (R$)</label><input type="number" step="0.01" className="form-input" value={soForm.labor_cost || 0} onChange={e => setSOForm({ ...soForm, labor_cost: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Desconto (R$)</label><input type="number" step="0.01" className="form-input" value={soForm.discount || 0} onChange={e => setSOForm({ ...soForm, discount: e.target.value })} /></div>
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)', marginBottom: 16 }}>Total: R$ {((parseFloat(soForm.parts_cost) || 0) + (parseFloat(soForm.labor_cost) || 0) - (parseFloat(soForm.discount) || 0)).toFixed(2)}</p>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Técnico Responsável</label><input type="text" className="form-input" value={soForm.technician || ''} onChange={e => setSOForm({ ...soForm, technician: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Garantia</label><input type="text" className="form-input" value={soForm.warranty || ''} onChange={e => setSOForm({ ...soForm, warranty: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Prazo</label><input type="text" className="form-input" value={soForm.deadline || ''} onChange={e => setSOForm({ ...soForm, deadline: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" value={soForm.notes || ''} onChange={e => setSOForm({ ...soForm, notes: e.target.value })} style={{ minHeight: 60 }} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowSOForm(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveSO}>Salvar O.S.</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
