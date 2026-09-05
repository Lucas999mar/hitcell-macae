import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const menuItems = [
    { path: '/admin', label: 'Visão Geral', icon: '📊', exact: true },
    { path: '/admin/site', label: 'Site', icon: '🌐' },
    { path: '/admin/produtos', label: 'Produtos', icon: '📦' },
    { path: '/admin/categorias', label: 'Categorias', icon: '📂' },
    { path: '/admin/estoque', label: 'Estoque', icon: '📊' },
    { path: '/admin/pedidos', label: 'Pedidos', icon: '🛒' },
    { path: '/admin/pos', label: 'Venda Balcão', icon: '💰' },
    { path: '/admin/assistencia', label: 'Assistência', icon: '🔧' },
    { path: '/admin/clientes', label: 'Clientes', icon: '👥' },
    { path: '/admin/fornecedores', label: 'Fornecedores', icon: '🏭' },
    { path: '/admin/financeiro', label: 'Financeiro', icon: '💵' },
    { path: '/admin/cupons', label: 'Cupons', icon: '🏷️' },
    { path: '/admin/funcionarios', label: 'Funcionários', icon: '👔' },
    { path: '/admin/pagamentos', label: 'Integrações', icon: '💳' },
    { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function AdminLayout() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    useEffect(() => {
        if (!isAdmin) navigate('/login');
    }, [isAdmin]);

    useEffect(() => { setMobileSidebar(false); }, [location]);

    if (!isAdmin) return null;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'} ${mobileSidebar ? 'mobile-open' : ''}`}>
                <div className="admin-sidebar-header">
                    <Link to="/" className="admin-sidebar-logo">
                        <span className="logo-hit">Hit</span><span className="logo-cell">Cell</span>
                    </Link>
                    <button className="btn btn-ghost btn-icon-sm hide-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="admin-sidebar-nav">
                    {menuItems.map(item => {
                        const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path) && item.path !== '/admin';
                        return (
                            <Link key={item.path} to={item.path} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                                <span className="admin-nav-icon">{item.icon}</span>
                                {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <span>👤</span>
                        {sidebarOpen && <div><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Administrador</div></div>}
                    </div>
                    <button className="btn btn-ghost btn-sm btn-full" onClick={logout} style={{ marginTop: 8 }}>
                        {sidebarOpen ? '🚪 Sair' : '🚪'}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileSidebar && <div className="admin-overlay" onClick={() => setMobileSidebar(false)} />}

            {/* Main Content */}
            <div className={`admin-main ${sidebarOpen ? '' : 'expanded'}`}>
                <header className="admin-topbar">
                    <button className="btn btn-ghost btn-icon-sm hide-desktop" onClick={() => setMobileSidebar(true)}>☰</button>
                    <h2 className="admin-page-title">Painel Administrativo</h2>
                    <div className="admin-topbar-actions">
                        <Link to="/" className="btn btn-ghost btn-sm">🌐 Ver Site</Link>
                    </div>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
