import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../database/db';

export default function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadStats(); }, []);

    async function loadStats() {
        const [orders, products, customers, payments, serviceOrders, serviceRequests, revenues, expenses] = await Promise.all([
            db.getAll('orders'), db.getAll('products'), db.getAll('customers'),
            db.getAll('payments'), db.getAll('service_orders'), db.getAll('service_requests'),
            db.getAll('revenues'), db.getAll('expenses')
        ]);

        const today = new Date().toDateString();
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
        const monthOrders = orders.filter(o => { const d = new Date(o.created_at); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
        const paidOrders = orders.filter(o => o.payment_status === 'approved' || o.status === 'paid' || o.status === 'delivered' || o.status === 'ready_pickup');
        const pendingOrders = orders.filter(o => o.status === 'pending_payment');
        const lowStockProducts = products.filter(p => p.active && p.stock <= (p.min_stock || 5));
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalCost = products.reduce((sum, p) => sum + ((p.cost || 0) * (p.stock || 0)), 0);
        const stockValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
        const activeServices = serviceOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
        const waitingApproval = serviceOrders.filter(o => o.status === 'waiting_approval');
        const topProducts = [...products].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 5);
        const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

        setStats({
            todayOrders: todayOrders.length, todayRevenue,
            monthOrders: monthOrders.length, monthRevenue,
            totalRevenue, totalOrders: orders.length,
            paidOrders: paidOrders.length, pendingOrders: pendingOrders.length,
            totalProducts: products.length, lowStock: lowStockProducts.length,
            stockValue, totalCost,
            totalCustomers: customers.length,
            activeServices: activeServices.length, waitingApproval: waitingApproval.length,
            newRequests: serviceRequests.length,
            grossProfit: monthRevenue * 0.6,
            topProducts, recentOrders, lowStockProducts
        });
        setLoading(false);
    }

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;

    const statCards = [
        { icon: '🛒', label: 'Vendas Hoje', value: stats.todayOrders, color: 'var(--red)', link: '/admin/pedidos' },
        { icon: '📈', label: 'Venda do Mês', value: stats.monthOrders, color: 'var(--blue)', link: '/admin/pedidos' },
        { icon: '💰', label: 'Faturamento Hoje', value: `R$ ${stats.todayRevenue?.toFixed(2)}`, color: 'var(--green)', link: '/admin/financeiro' },
        { icon: '💵', label: 'Faturamento Mês', value: `R$ ${stats.monthRevenue?.toFixed(2)}`, color: 'var(--green)', link: '/admin/financeiro' },
        { icon: '⏳', label: 'Pedidos Pendentes', value: stats.pendingOrders, color: 'var(--yellow)', link: '/admin/pedidos' },
        { icon: '✅', label: 'Pedidos Pagos', value: stats.paidOrders, color: 'var(--green)', link: '/admin/pedidos' },
        { icon: '🔧', label: 'Serviços Ativos', value: stats.activeServices, color: 'var(--blue)', link: '/admin/assistencia' },
        { icon: '📋', label: 'Orçam. Pendentes', value: stats.waitingApproval, color: 'var(--orange)', link: '/admin/assistencia' },
        { icon: '⚠️', label: 'Estoque Baixo', value: stats.lowStock, color: 'var(--red)', link: '/admin/estoque' },
        { icon: '📦', label: 'Total Produtos', value: stats.totalProducts, color: 'var(--gray-400)', link: '/admin/produtos' },
        { icon: '👥', label: 'Clientes', value: stats.totalCustomers, color: 'var(--blue)', link: '/admin/clientes' },
        { icon: '📊', label: 'Valor Estoque', value: `R$ ${stats.stockValue?.toFixed(2)}`, color: 'var(--metallic-text)', link: '/admin/estoque' },
    ];

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>📊 Visão Geral</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 30 }}>
                {statCards.map((card, i) => (
                    <Link to={card.link} key={i} className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>{card.icon}</div>
                        <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                        <div className="stat-label">{card.label}</div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dashboard-grid">
                {/* Recent Orders */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 700 }}>Pedidos Recentes</h3>
                        <Link to="/admin/pedidos" className="btn btn-ghost btn-sm">Ver Todos →</Link>
                    </div>
                    {stats.recentOrders?.length === 0 ? (
                        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: 20 }}>Nenhum pedido ainda</p>
                    ) : (
                        stats.recentOrders?.map(o => (
                            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--red)' }}>{o.number}</span>
                                    <span style={{ color: 'var(--gray-500)', marginLeft: 8 }}>{o.customer_name}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: 600 }}>R$ {o.total?.toFixed(2)}</span>
                                    <span className={`badge badge-${o.status === 'pending_payment' ? 'yellow' : 'green'}`} style={{ marginLeft: 8 }}>
                                        {o.status === 'pending_payment' ? 'Pendente' : o.status === 'paid' ? 'Pago' : o.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Top Products */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 700 }}>Mais Vendidos</h3>
                        <Link to="/admin/produtos" className="btn btn-ghost btn-sm">Ver Todos →</Link>
                    </div>
                    {stats.topProducts?.map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gray-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                                <span>{p.name}</span>
                            </div>
                            <span style={{ color: 'var(--gray-400)' }}>{p.sales_count || 0} vendas</span>
                        </div>
                    ))}
                </div>

                {/* Low Stock Alert */}
                {stats.lowStockProducts?.length > 0 && (
                    <div className="card" style={{ borderLeft: '3px solid var(--red)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚠️ Estoque Baixo</h3>
                        {stats.lowStockProducts.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                                <span>{p.name}</span>
                                <span style={{ color: 'var(--red)', fontWeight: 700 }}>{p.stock} un.</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚡ Ações Rápidas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <Link to="/admin/pos" className="btn btn-primary btn-sm">💰 Nova Venda</Link>
                        <Link to="/admin/produtos" className="btn btn-secondary btn-sm">📦 Novo Produto</Link>
                        <Link to="/admin/assistencia" className="btn btn-secondary btn-sm">🔧 Nova O.S.</Link>
                        <Link to="/admin/estoque" className="btn btn-secondary btn-sm">📊 Estoque</Link>
                        <Link to="/admin/financeiro" className="btn btn-secondary btn-sm">💵 Financeiro</Link>
                        <Link to="/admin/clientes" className="btn btn-secondary btn-sm">👥 Clientes</Link>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
