import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import db from '../../database/db';
import './Shop.css';

export default function Shop() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: searchParams.get('categoria') || '',
        brand: '',
        priceMin: '',
        priceMax: '',
        color: '',
        compatibility: '',
        availability: searchParams.get('promo') === 'true' ? 'promo' : 'all',
        sort: searchParams.get('ordem') || 'novidades',
        search: searchParams.get('q') || ''
    });
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [prods, cats] = await Promise.all([
            db.query('products', p => p.active),
            db.query('categories', c => c.active)
        ]);
        setProducts(prods);
        setCategories(cats.sort((a, b) => a.order - b.order));
        setLoading(false);
    }

    const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products]);
    const colors = useMemo(() => [...new Set(products.flatMap(p => p.colors || []))].sort(), [products]);

    const filtered = useMemo(() => {
        let result = [...products];
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
        }
        if (filters.category) result = result.filter(p => p.category_id === filters.category);
        if (filters.brand) result = result.filter(p => p.brand === filters.brand);
        if (filters.priceMin) result = result.filter(p => (p.promo_price || p.price) >= parseFloat(filters.priceMin));
        if (filters.priceMax) result = result.filter(p => (p.promo_price || p.price) <= parseFloat(filters.priceMax));
        if (filters.color) result = result.filter(p => p.colors?.includes(filters.color));
        if (filters.compatibility) {
            const q = filters.compatibility.toLowerCase();
            result = result.filter(p => p.compatibility?.some(c => c.toLowerCase().includes(q)));
        }
        if (filters.availability === 'available') result = result.filter(p => p.stock > 0);
        if (filters.availability === 'promo') result = result.filter(p => p.promo_price && p.stock > 0);

        switch (filters.sort) {
            case 'menor-preco': result.sort((a, b) => (a.promo_price || a.price) - (b.promo_price || b.price)); break;
            case 'maior-preco': result.sort((a, b) => (b.promo_price || b.price) - (a.promo_price || a.price)); break;
            case 'mais-vendidos': result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)); break;
            case 'novidades': result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
            default: break;
        }
        return result;
    }, [products, filters]);

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;

    return (
        <div className="shop-page">
            <div className="container">
                <div className="shop-header">
                    <div>
                        <h1 className="section-title">Loja</h1>
                        <p className="section-subtitle">{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className="btn btn-secondary hide-desktop" onClick={() => setFiltersOpen(!filtersOpen)}>
                        🔽 Filtros
                    </button>
                </div>

                <div className="shop-layout">
                    {/* Filters Sidebar */}
                    <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
                        <div className="filter-section">
                            <h3 className="filter-title">Pesquisar</h3>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Buscar produto..."
                                value={filters.search}
                                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            />
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Categoria</h3>
                            <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                                <option value="">Todas</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                            </select>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Marca</h3>
                            <select className="form-select" value={filters.brand} onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}>
                                <option value="">Todas</option>
                                {brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Faixa de Preço</h3>
                            <div className="filter-price-row">
                                <input type="number" className="form-input" placeholder="Mín" value={filters.priceMin} onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))} />
                                <span>—</span>
                                <input type="number" className="form-input" placeholder="Máx" value={filters.priceMax} onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))} />
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Cor</h3>
                            <select className="form-select" value={filters.color} onChange={e => setFilters(f => ({ ...f, color: e.target.value }))}>
                                <option value="">Todas</option>
                                {colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Compatibilidade</h3>
                            <input type="text" className="form-input" placeholder="Ex: iPhone 15" value={filters.compatibility} onChange={e => setFilters(f => ({ ...f, compatibility: e.target.value }))} />
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Disponibilidade</h3>
                            <select className="form-select" value={filters.availability} onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}>
                                <option value="all">Todos</option>
                                <option value="available">Em Estoque</option>
                                <option value="promo">Em Promoção</option>
                            </select>
                        </div>

                        <button className="btn btn-ghost btn-full" onClick={() => setFilters({ category: '', brand: '', priceMin: '', priceMax: '', color: '', compatibility: '', availability: 'all', sort: 'novidades', search: '' })}>
                            Limpar Filtros
                        </button>
                    </aside>

                    {/* Products */}
                    <div className="shop-products">
                        <div className="shop-sort">
                            <label>Ordenar por:</label>
                            <select className="form-select" value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                                <option value="novidades">Novidades</option>
                                <option value="menor-preco">Menor Preço</option>
                                <option value="maior-preco">Maior Preço</option>
                                <option value="mais-vendidos">Mais Vendidos</option>
                            </select>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔍</div>
                                <p className="empty-state-title">Nenhum produto encontrado</p>
                                <p className="empty-state-text">Tente ajustar os filtros ou pesquisar por outro termo.</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {filtered.map(prod => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product }) {
    const discount = product.promo_price ? Math.round((1 - product.promo_price / product.price) * 100) : 0;
    const price = product.promo_price || product.price;
    return (
        <Link to={`/produto/${product.id}`} className="product-card">
            {discount > 0 && <span className="product-discount-badge">-{discount}%</span>}
            {product.stock === 0 && <span className="product-unavailable-badge">Indisponível</span>}
            <div className="product-image">
                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="product-image-placeholder">📱</div>}
            </div>
            <div className="product-info">
                <p className="product-brand">{product.brand}</p>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-pricing">
                    {product.promo_price && <span className="product-original-price">R$ {product.price.toFixed(2)}</span>}
                    <span className="product-price">R$ {price.toFixed(2)}</span>
                </div>
            </div>
        </Link>
    );
}
