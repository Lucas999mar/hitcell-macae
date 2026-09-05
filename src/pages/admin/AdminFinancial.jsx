import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminFinancial() {
    const [tab, setTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [revenues, setRevenues] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [products, setProducts] = useState([]);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expForm, setExpForm] = useState({ description: '', amount: 0, category: '', type: 'expense', due_date: '' });
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        const [o, r, e, p] = await Promise.all([db.getAll('orders'), db.getAll('revenues'), db.getAll('expenses'), db.getAll('products')]);
        setOrders(o); setRevenues(r); setExpenses(e); setProducts(p);
    }

    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered' || o.status === 'ready_pickup');
    const totalRevenueOrders = paidOrders.reduce((s, o) => s + ((o.total) || 0), 0);
    const totalRevenues = revenues.reduce((s, r) => s + (r.amount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalCost = paidOrders.reduce((s, o) => {
        return s + (o.items || []).reduce((is, item) => {
            const prod = products.find(p => p.id === item.product_id);
            return is + ((prod?.cost || 0) * item.quantity);
        }, 0);
    }, 0);
    const grossProfit = totalRevenueOrders - totalCost;
    const netProfit = grossProfit - totalExpenses;
    const stockValue = products.reduce((s, p) => s + ((p.price || 0) * (p.stock || 0)), 0);

    async function saveExpense() {
        if (!expForm.description || !expForm.amount) { toast.error('Preencha os campos'); return; }
        await db.put('expenses', { ...expForm, amount: parseFloat(expForm.amount) });
        toast.success('Despesa registrada!');
        setShowExpenseForm(false);
        load();
    }

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>💵 Financeiro</h1>

            <div className="tabs" style={{ marginBottom: 24 }}>
                <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Visão Geral</button>
                <button className={`tab ${tab === 'revenues' ? 'active' : ''}`} onClick={() => setTab('revenues')}>Receitas</button>
                <button className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>Despesas</button>
            </div>

            {tab === 'overview' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 30 }}>
                        {[
                            { icon: '💰', label: 'Faturamento Total', value: `R$ ${totalRevenueOrders.toFixed(2)}`, color: 'var(--green)' },
                            { icon: '📦', label: 'Custo Produtos', value: `R$ ${totalCost.toFixed(2)}`, color: 'var(--red)' },
                            { icon: '📊', label: 'Lucro Bruto', value: `R$ ${grossProfit.toFixed(2)}`, color: 'var(--green)' },
                            { icon: '📉', label: 'Despesas', value: `R$ ${totalExpenses.toFixed(2)}`, color: 'var(--red)' },
                            { icon: '💵', label: 'Lucro Líquido', value: `R$ ${netProfit.toFixed(2)}`, color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' },
                            { icon: '🏪', label: 'Valor Estoque', value: `R$ ${stockValue.toFixed(2)}`, color: 'var(--blue)' },
                            { icon: '🛒', label: 'Pedidos Pagos', value: paidOrders.length, color: 'var(--green)' },
                            { icon: '📈', label: 'Ticket Médio', value: `R$ ${paidOrders.length ? (totalRevenueOrders / paidOrders.length).toFixed(2) : '0.00'}`, color: 'var(--blue)' },
                        ].map((card, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>{card.icon}</div>
                                <div className="stat-value" style={{ color: card.color, fontSize: '1.4rem' }}>{card.value}</div>
                                <div className="stat-label">{card.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Últimas Transações</h3>
                        {paidOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10).map(o => (
                            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--red)' }}>{o.number}</span>
                                    <span style={{ color: 'var(--gray-500)', marginLeft: 8 }}>{o.customer_name}</span>
                                    <span className="badge badge-green" style={{ marginLeft: 8 }}>{o.channel === 'pos' ? 'Balcão' : 'Site'}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--green)' }}>+R$ {o.total?.toFixed(2)}</span>
                                    <span style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginLeft: 8 }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'revenues' && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Receitas</h3>
                    {paidOrders.map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                            <span>{o.number} — {o.customer_name}</span>
                            <span style={{ color: 'var(--green)', fontWeight: 700 }}>R$ {o.total?.toFixed(2)}</span>
                        </div>
                    ))}
                    {revenues.map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                            <span>{r.description}</span>
                            <span style={{ color: r.amount >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>R$ {r.amount?.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'expenses' && (
                <div>
                    <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => setShowExpenseForm(true)}>+ Nova Despesa</button>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Despesas</h3>
                        {expenses.length === 0 ? <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: 20 }}>Nenhuma despesa registrada</p> :
                            expenses.map(e => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                                    <div><span style={{ fontWeight: 600 }}>{e.description}</span>{e.category && <span className="badge badge-gray" style={{ marginLeft: 8 }}>{e.category}</span>}</div>
                                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>R$ {e.amount?.toFixed(2)}</span>
                                </div>
                            ))
                        }
                    </div>
                    {showExpenseForm && (
                        <div className="modal-overlay" onClick={() => setShowExpenseForm(false)}>
                            <div className="modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header"><h3 className="modal-title">Nova Despesa</h3><button className="modal-close" onClick={() => setShowExpenseForm(false)}>✕</button></div>
                                <div className="modal-body">
                                    <div className="form-group"><label className="form-label">Descrição *</label><input type="text" className="form-input" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Valor (R$) *</label><input type="number" step="0.01" className="form-input" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} /></div>
                                        <div className="form-group"><label className="form-label">Categoria</label><select className="form-select" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}><option value="">Selecione</option><option value="aluguel">Aluguel</option><option value="fornecedor">Fornecedor</option><option value="salarios">Salários</option><option value="marketing">Marketing</option><option value="utilidades">Utilidades</option><option value="outros">Outros</option></select></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Vencimento</label><input type="date" className="form-input" value={expForm.due_date} onChange={e => setExpForm({ ...expForm, due_date: e.target.value })} /></div>
                                </div>
                                <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowExpenseForm(false)}>Cancelar</button><button className="btn btn-primary" onClick={saveExpense}>Registrar</button></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
