import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import db from '../../database/db';

export default function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // today, week, month, quarter, year, custom
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    useEffect(() => { loadStats(); }, [period, dateStart, dateEnd]);

    async function loadStats() {
        setLoading(true);
        const [orders, products, customers, serviceOrders] = await Promise.all([
            db.getAll('orders'), db.getAll('products'), db.getAll('customers'), db.getAll('service_orders')
        ]);

        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (period === 'today') startDate.setHours(0, 0, 0, 0);
        else if (period === 'week') startDate.setDate(now.getDate() - 7);
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
        else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);
        else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
        else if (period === 'custom') {
            if (dateStart) startDate = new Date(dateStart + 'T00:00:00');
            else startDate = new Date(2000, 0, 1);
            if (dateEnd) endDate = new Date(dateEnd + 'T23:59:59');
        }

        const filteredOrders = orders.filter(o => {
            const d = new Date(o.created_at);
            if (period === 'custom') return d >= startDate && d <= endDate;
            return d >= startDate;
        });
        const paidOrders = filteredOrders.filter(o => ['approved', 'paid', 'delivered', 'ready_pickup'].includes(o.status || o.payment_status));

        const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const totalOrders = paidOrders.length;
        const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Approximate cost from products sold (mock calculation based on items if available, or 40% margin default)
        // Since order items aren't heavily detailed here, we estimate standard 50% markup for margins if exact cost isn't mapped
        const estimatedMargin = totalRevenue * 0.45;
        const estimatedCosts = totalRevenue - estimatedMargin;

        const stockValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
        const stockCost = products.reduce((sum, p) => sum + ((Number(p.cost) || 0) * (Number(p.stock) || 0)), 0);
        const lowStock = products.filter(p => p.stock <= (p.min_stock || 5));

        const activeServices = serviceOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));

        // Generate Chart Data (Daily Revenue)
        const dailyDataMap = {};
        filteredOrders.forEach(o => {
            const dateStr = new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!dailyDataMap[dateStr]) dailyDataMap[dateStr] = { name: dateStr, revenue: 0, orders: 0 };
            if (['approved', 'paid', 'delivered', 'ready_pickup'].includes(o.status || o.payment_status)) {
                dailyDataMap[dateStr].revenue += Number(o.total) || 0;
                dailyDataMap[dateStr].orders += 1;
            }
        });
        const chartData = Object.values(dailyDataMap).sort((a, b) => {
            const [d1, m1] = a.name.split('/');
            const [d2, m2] = b.name.split('/');
            return new Date(2020, m1 - 1, d1) - new Date(2020, m2 - 1, d2);
        });

        // Generate Category Data (Mock based on top products)
        const topProducts = [...products].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 5);

        setStats({
            totalRevenue, ticketMedio, totalOrders, estimatedMargin, estimatedCosts,
            stockValue, stockCost, lowStock: lowStock.length, totalProducts: products.length,
            activeServices: activeServices.length, customers: customers.length,
            chartData, topProducts
        });
        setLoading(false);
    }

    const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

    return (
        <div className="animate-fade pb-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>📊 Dashboard BI</h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Visão geral de receitas, margens e métricas</p>
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

            {loading ? (
                <div className="page-loader" style={{ height: 400 }}><div className="loader"></div></div>
            ) : (
                <>
                    {/* Primary KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.1), rgba(0,0,0,0))', border: '1px solid rgba(220,38,38,0.2)' }}>
                            <div className="stat-label">Receita Bruta</div>
                            <div className="stat-value" style={{ color: 'var(--white)', fontSize: '1.8rem' }}>R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: 8 }}>Vendas concluídas</div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(0,0,0,0))', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <div className="stat-label">Lucro / Margem (Est.)</div>
                            <div className="stat-value" style={{ color: 'var(--green)', fontSize: '1.8rem' }}>R$ {stats.estimatedMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>Baseado em margem padrão</div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0))', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <div className="stat-label">Ticket Médio</div>
                            <div className="stat-value" style={{ color: 'var(--white)', fontSize: '1.8rem' }}>R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>{stats.totalOrders} pedidos pagos</div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(0,0,0,0))', border: '1px solid rgba(234,179,8,0.2)' }}>
                            <div className="stat-label">Valor do Estoque</div>
                            <div className="stat-value" style={{ color: 'var(--white)', fontSize: '1.8rem' }}>R$ {stats.stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>Custo: R$ {stats.stockCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, marginBottom: 24 }} className="dashboard-grid">
                        {/* Revenue Chart */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Receita por Período (R$)</h3>
                            <div style={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.chartData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--red)" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--gray-500)" fontSize={12} tickMargin={10} />
                                        <YAxis stroke="var(--gray-500)" fontSize={12} tickFormatter={v => `R$${v}`} />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--black-card)', border: '1px solid var(--gray-700)', borderRadius: 8 }}
                                            labelStyle={{ color: 'var(--gray-300)', marginBottom: 4 }}
                                            itemStyle={{ color: 'var(--red)', fontWeight: 700 }}
                                            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="var(--red)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Produtos Mais Vendidos</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {stats.topProducts.map((p, i) => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name.length > 22 ? p.name.substring(0, 22) + '...' : p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>R$ {p.price.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700 }}>{p.sales_count || 0} un</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }} className="dashboard-grid">
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Status Operacional</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ background: 'var(--black-soft)', padding: 16, borderRadius: 'var(--radius-lg)' }}>
                                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Serviços Ativos</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{stats.activeServices}</div>
                                </div>
                                <div style={{ background: 'var(--black-soft)', padding: 16, borderRadius: 'var(--radius-lg)' }}>
                                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Estoque Baixo</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red)', marginTop: 4 }}>{stats.lowStock}</div>
                                </div>
                                <div style={{ background: 'var(--black-soft)', padding: 16, borderRadius: 'var(--radius-lg)' }}>
                                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Total Produtos</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{stats.totalProducts}</div>
                                </div>
                                <div style={{ background: 'var(--black-soft)', padding: 16, borderRadius: 'var(--radius-lg)' }}>
                                    <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Clientes Regis.</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{stats.customers}</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Atalhos do Sistema</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <Link to="/admin/pos" className="btn btn-primary" style={{ height: 'auto', padding: '16px 0' }}>💰 Nova Venda</Link>
                                <Link to="/admin/assistencia" className="btn btn-secondary" style={{ height: 'auto', padding: '16px 0' }}>🔧 Ordem Serviço</Link>
                                <Link to="/admin/pedidos" className="btn btn-secondary" style={{ height: 'auto', padding: '16px 0' }}>📦 Pedidos</Link>
                                <Link to="/admin/estoque" className="btn btn-secondary" style={{ height: 'auto', padding: '16px 0' }}>📊 Estoque</Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
