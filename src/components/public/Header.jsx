import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

export default function Header() {
    const { user, isLoggedIn, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/loja?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { path: '/', label: 'Início' },
        { path: '/loja', label: 'Loja' },
        { path: '/categorias', label: 'Categorias' },
        { path: '/assistencia', label: 'Assistência Técnica' },
        { path: '/acompanhar-pedido', label: 'Acompanhar Pedido' },
        { path: '/acompanhar-servico', label: 'Acompanhar Serviço' },
        { path: '/sobre', label: 'Sobre a HitCell' },
        { path: '/contato', label: 'Contato' },
    ];

    return (
        <>
            <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
                {/* Top Bar */}
                <div className="header-top">
                    <div className="container header-top-inner">
                        <span className="header-top-text">📍 Rua Alcides Mourão, 350 – Aroeira, Macaé – RJ</span>
                        <div className="header-top-right">
                            <a href="https://wa.me/5522999737366" target="_blank" rel="noopener noreferrer" className="header-top-link">
                                📱 (22) 99973-7366
                            </a>
                            <a href="https://www.instagram.com/hitcellmacae_?stkn=cDJ1Z3EwcnQ2cjFq" target="_blank" rel="noopener noreferrer" className="header-top-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                @hitcellmacae_
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="header-main">
                    <div className="container header-main-inner">
                        <Link to="/" className="header-logo">
                            <img src="/images/logo-wide.png" alt="HitCell Macaé" className="header-logo-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            <div className="header-logo-fallback" style={{ display: 'none' }}>
                                <span className="logo-hit">Hit</span><span className="logo-cell">Cell</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="header-nav hide-mobile">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`header-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="header-actions">
                            <button className="header-action-btn" onClick={() => setSearchOpen(!searchOpen)} title="Pesquisar">
                                🔍
                            </button>

                            <Link to={isLoggedIn ? (isAdmin ? '/admin' : '/conta') : '/login'} className="header-action-btn hide-mobile" title="Minha Conta">
                                👤
                            </Link>

                            <Link to="/carrinho" className="header-action-btn header-cart-btn" title="Carrinho">
                                🛒
                                {itemCount > 0 && <span className="header-cart-badge">{itemCount}</span>}
                            </Link>

                            <a href="https://wa.me/5522999737366" target="_blank" rel="noopener noreferrer" className="header-whatsapp-btn" title="WhatsApp">
                                💬
                            </a>

                            <button className="header-menu-btn hide-desktop" onClick={() => setMenuOpen(!menuOpen)}>
                                {menuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {searchOpen && (
                    <div className="header-search animate-fade">
                        <div className="container">
                            <form onSubmit={handleSearch} className="header-search-form">
                                <input
                                    type="text"
                                    placeholder="Pesquisar produtos, acessórios, serviços..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="header-search-input"
                                />
                                <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSearchOpen(false)}>✕</button>
                            </form>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
                    <nav className="mobile-menu animate-slide" onClick={e => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <span className="mobile-menu-title">Menu</span>
                            <button className="modal-close" onClick={() => setMenuOpen(false)}>✕</button>
                        </div>

                        {isLoggedIn && (
                            <div className="mobile-menu-user">
                                <span>👤</span>
                                <div>
                                    <div className="mobile-menu-user-name">{user.name}</div>
                                    <Link to={isAdmin ? '/admin' : '/conta'} className="mobile-menu-user-link">
                                        {isAdmin ? 'Painel Admin' : 'Minha Conta'}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`mobile-menu-link ${location.pathname === link.path ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="mobile-menu-divider" />

                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                                    🔐 Entrar
                                </Link>
                                <Link to="/registro" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                                    ✨ Criar Conta
                                </Link>
                            </>
                        ) : (
                            <Link to={isAdmin ? '/admin' : '/conta'} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                                📊 {isAdmin ? 'Painel Administrativo' : 'Minha Conta'}
                            </Link>
                        )}
                    </nav>
                </div>
            )}

            {/* Spacer */}
            <div style={{ height: 'calc(var(--header-height) + 36px)' }} />
        </>
    );
}
