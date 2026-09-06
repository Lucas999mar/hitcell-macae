import { useState, useEffect, useMemo } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminFinancial() {
    const [tab, setTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [revenues, setRevenues] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [products, setProducts] = useState([]);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expForm, setExpForm] = useState({ description: '', amount: 0, category: '', type: 'expense', due_date: '' });

    // Filtros de Data
    const [period, setPeriod] = useState('month'); // today, week, month, quarter, year, custom
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        const [o, r, e, p] = await Promise.all([db.getAll('orders'), db.getAll('revenues'), db.getAll('expenses'), db.getAll('products')]);
        setOrders(o); setRevenues(r); setExpenses(e); setProducts(p);
    }

    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        let s = new Date();
        let e = new Date();
        if (period === 'today') s.setHours(0, 0, 0, 0);
        else if (period === 'week') s.setDate(now.getDate() - 7);
        else if (period === 'month') s.setMonth(now.getMonth() - 1);
        else if (period === 'quarter') s.setMonth(now.getMonth() - 3);
        else if (period === 'year') s.setFullYear(now.getFullYear() - 1);
        else if (period === 'custom') {
            if (dateStart) s = new Date(dateStart + 'T00:00:00');
            else s = new Date(2000, 0, 1);
            if (dateEnd) e = new Date(dateEnd + 'T23:59:59');
        }
        return { startDate: s, endDate: e };
    }, [period, dateStart, dateEnd]);

    const filteredOrders = useMemo(() => orders.filter(o => {
        const d = new Date(o.created_at);
        return period === 'custom' ? (d >= startDate && d <= endDate) : (d >= startDate);
    }), [orders, period, startDate, endDate]);

    const filteredRevenues = useMemo(() => revenues.filter(r => {
        const d = new Date(r.created_at || new Date());
        return period === 'custom' ? (d >= startDate && d <= endDate) : (d >= startDate);
    }), [revenues, period, startDate, endDate]);

    const filteredExpenses = useMemo(() => expenses.filter(ex => {
        const d = new Date(ex.created_at || new Date());
        return period === 'custom' ? (d >= startDate && d <= endDate) : (d >= startDate);
    }), [expenses, period, startDate, endDate]);

    const paidOrders = filteredOrders.filter(o => o.status === 'paid' || o.status === 'delivered' || o.status === 'ready_pickup' || o.payment_status === 'paid');
    const totalRevenueOrders = paidOrders.reduce((s, o) => s + ((o.total) || 0), 0);
    const totalExtraRevenues = filteredRevenues.reduce((s, r) => s + (r.amount || 0), 0);
    const totalGrossRevenue = totalRevenueOrders + totalExtraRevenues;
    const totalExpenses = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);

    const totalCost = paidOrders.reduce((s, o) => {
        return s + (o.items || []).reduce((is, item) => {
            const prod = products.find(p => p.id === item.product_id);
            return is + ((prod?.cost || 0) * item.quantity);
        }, 0);
    }, 0);

    const grossProfit = totalGrossRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses;
    const stockValue = products.reduce((s, p) => s + ((p.price || 0) * (p.stock || 0)), 0);

    // Gerar dados pro gráfico Recharts
    const chartData = useMemo(() => {
        const daysToPoints = {};
        paidOrders.forEach(o => {
            const day = new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!daysToPoints[day]) daysToPoints[day] = { name: day, receita: 0, despesa: 0 };
            daysToPoints[day].receita += (o.total || 0);
        });
        filteredRevenues.forEach(r => {
            const day = new Date(r.created_at || new Date()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!daysToPoints[day]) daysToPoints[day] = { name: day, receita: 0, despesa: 0 };
            daysToPoints[day].receita += (r.amount || 0);
        });
        filteredExpenses.forEach(e => {
            const dt = e.created_at ? new Date(e.created_at) : new Date();
            const day = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!daysToPoints[day]) daysToPoints[day] = { name: day, receita: 0, despesa: 0 };
            daysToPoints[day].despesa += (e.amount || 0);
        });

        let sorted = Object.values(daysToPoints).sort((a, b) => {
            const [da, ma] = a.name.split('/');
            const [db, mb] = b.name.split('/');
            return new Date(2025, parseInt(ma) - 1, parseInt(da)) - new Date(2025, parseInt(mb) - 1, parseInt(db)); // Simplified sort
        });
        return sorted;
    }, [paidOrders, filteredRevenues, filteredExpenses]);

    async function saveExpense() {
        if (!expForm.description || !expForm.amount) { toast.error('Preencha os campos'); return; }
        await db.put('expenses', { ...expForm, amount: parseFloat(expForm.amount) });
        toast.success('Despesa registrada!');
        setShowExpenseForm(false);
        load();
    }

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>💵 Gestão Financeira</h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Balancete, Lucratividade e Fluxo de Caixa</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--black-card)', padding: '4px 8px', borderRadius: 'var(--radius-lg)' }}>
                        <input type="date" value={dateStart} onChange={e => { setDateStart(e.target.value); setPeriod('custom'); }} className="form-input" style={{ width: 130, padding: '4px 8px', height: 32, fontSize: '0.85rem' }} />
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>até</span>
                        <input type="date" value={dateEnd} onChange={e => { setDateEnd(e.target.value); setPeriod('custom'); }} className="form-input" style={{ width: 130, padding: '4px 8px', height: 32, fontSize: '0.85rem' }} />
                    </div>
                    <div className="tabs" style={{ background: 'var(--black-card)', padding: 4, margin: 0, borderRadius: 'var(--radius-lg)' }}>
                        <button className={`tab ${period === 'today' ? 'active' : ''}`} onClick={() => { setPeriod('today'); setDateStart(''); setDateEnd(''); }}>Hoje</button>
                        <button className={`tab ${period === 'week' ? 'active' : ''}`} onClick={() => { setPeriod('week'); setDateStart(''); setDateEnd(''); }}>7 Dias</button>
                        <button className={`tab ${period === 'month' ? 'active' : ''}`} onClick={() => { setPeriod('month'); setDateStart(''); setDateEnd(''); }}>30 Dias</button>
                        <button className={`tab ${period === 'quarter' ? 'active' : ''}`} onClick={() => { setPeriod('quarter'); setDateStart(''); setDateEnd(''); }}>Trimestre</button>
                        <button className={`tab ${period === 'year' ? 'active' : ''}`} onClick={() => { setPeriod('year'); setDateStart(''); setDateEnd(''); }}>Anual</button>
                    </div>
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 24 }}>
                <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Visão Geral</button>
                <button className={`tab ${tab === 'revenues' ? 'active' : ''}`} onClick={() => setTab('revenues')}>Receitas</button>
                <button className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>Despesas</button>
            </div>

            {tab === 'overview' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                        {[
                            { icon: '💰', label: 'Faturamento Total', value: `R$ ${totalGrossRevenue.toFixed(2)}`, color: 'var(--green)' },
                            { icon: '📦', label: 'Custo Produtos (CMV)', value: `R$ ${totalCost.toFixed(2)}`, color: 'var(--red)' },
                            { icon: '📊', label: 'Lucro Bruto', value: `R$ ${grossProfit.toFixed(2)}`, color: 'var(--green)' },
                            { icon: '📉', label: 'Despesas Gerais', value: `R$ ${totalExpenses.toFixed(2)}`, color: 'var(--red)' },
                            { icon: '💵', label: 'Lucro Líquido', value: `R$ ${netProfit.toFixed(2)}`, color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' },
                            { icon: '🏪', label: 'Valor Estoque', value: `R$ ${stockValue.toFixed(2)}`, color: 'var(--blue)' },
                            { icon: '🛒', label: 'Pedidos Pagos', value: paidOrders.length, color: 'var(--green)' },
                            { icon: '📈', label: 'Ticket Médio', value: `R$ ${paidOrders.length ? (totalRevenueOrders / paidOrders.length).toFixed(2) : '0.00'}`, color: 'var(--blue)' },
                        ].map((card, i) => (
                            <div key={i} className="stat-card" style={{ padding: 16 }}>
                                <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color, marginBottom: 12 }}>{card.icon}</div>
                                <div className="stat-value" style={{ color: card.color, fontSize: '1.25rem' }}>{card.value}</div>
                                <div className="stat-label" style={{ fontSize: '0.8rem' }}>{card.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Curva Financeira</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
                                    <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    <Area type="monotone" dataKey="receita" name="Receitas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
                                    <Area type="monotone" dataKey="despesa" name="Despesas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDesp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
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
