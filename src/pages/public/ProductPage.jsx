import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import db from '../../database/db';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [related, setRelated] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { isLoggedIn, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => { loadProduct(); }, [id]);

    async function loadProduct() {
        setLoading(true);
        const prod = await db.getById('products', id);
        if (!prod) { setLoading(false); return; }
        setProduct(prod);
        setSelectedColor(prod.colors?.[0] || '');
        if (prod.category_id) {
            const cat = await db.getById('categories', prod.category_id);
            setCategory(cat);
            const relProds = await db.query('products', p => p.category_id === prod.category_id && p.id !== prod.id && p.active);
            setRelated(relProds.slice(0, 4));
        }
        setLoading(false);
    }

    async function handleAddToCart() {
        try {
            await addItem(product, quantity, selectedColor);
            toast.success('Produto adicionado ao carrinho!');
        } catch (err) { toast.error(err.message); }
    }

    async function handleBuyNow() {
        try {
            await addItem(product, quantity, selectedColor);
            navigate('/carrinho');
        } catch (err) { toast.error(err.message); }
    }

    async function handleFavorite() {
        if (!isLoggedIn) { toast.warning('Faça login para favoritar'); return; }
        const existing = await db.query('favorites', f => f.user_id === user.id && f.product_id === product.id);
        if (existing.length > 0) {
            await db.delete('favorites', existing[0].id);
            toast.info('Removido dos favoritos');
        } else {
            await db.put('favorites', { user_id: user.id, product_id: product.id });
            toast.success('Adicionado aos favoritos!');
        }
    }

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;
    if (!product) return <div className="container section"><div className="empty-state"><div className="empty-state-icon">❌</div><p className="empty-state-title">Produto não encontrado</p><Link to="/loja" className="btn btn-primary">Voltar à Loja</Link></div></div>;

    const price = product.promo_price || product.price;
    const discount = product.promo_price ? Math.round((1 - product.promo_price / product.price) * 100) : 0;
    const maxInstallments = Math.min(12, Math.max(1, Math.floor(price / 10)));

    return (
        <div className="container" style={{ padding: '30px 20px 60px' }}>
            {/* Breadcrumb */}
            <nav style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to="/" style={{ color: 'var(--gray-400)' }}>Início</Link> /
                <Link to="/loja" style={{ color: 'var(--gray-400)' }}>Loja</Link> /
                {category && <><Link to={`/loja?categoria=${category.id}`} style={{ color: 'var(--gray-400)' }}>{category.name}</Link> /</>}
                <span style={{ color: 'var(--white)' }}>{product.name}</span>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }} className="product-detail-grid">
                {/* Images */}
                <div>
                    <div style={{ background: 'var(--black-card)', border: '1px solid var(--gray-800)', borderRadius: 'var(--radius-xl)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {discount > 0 && <span className="product-discount-badge" style={{ fontSize: '1rem', padding: '6px 14px' }}>-{discount}%</span>}
                        {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ fontSize: '8rem', opacity: 0.15 }}>📱</div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{product.brand}</p>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>{product.name}</h1>

                    {product.model && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 4 }}>Modelo: {product.model}</p>}
                    {product.compatibility?.length > 0 && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 16 }}>Compatível: {product.compatibility.join(', ')}</p>}

                    {/* Price */}
                    <div style={{ background: 'var(--black-card)', border: '1px solid var(--gray-800)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
                        {product.promo_price && <p style={{ textDecoration: 'line-through', color: 'var(--gray-500)', fontSize: '1rem' }}>R$ {product.price.toFixed(2)}</p>}
                        <p style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--green)' }}>R$ {price.toFixed(2)}</p>
                        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginTop: 4 }}>
                            ou {maxInstallments}x de R$ {(price / maxInstallments).toFixed(2)} no cartão
                        </p>
                        <p style={{ color: 'var(--green)', fontSize: '0.85rem', marginTop: 4 }}>💰 R$ {(price * 0.95).toFixed(2)} no Pix (5% off)</p>
                    </div>

                    {/* Colors */}
                    {product.colors?.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <label className="form-label">Cor: {selectedColor}</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {product.colors.map(c => (
                                    <button key={c} onClick={() => setSelectedColor(c)}
                                        className={`btn btn-sm ${selectedColor === c ? 'btn-primary' : 'btn-secondary'}`}
                                    >{c}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label">Quantidade</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="btn btn-secondary btn-icon-sm" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                            <button className="btn btn-secondary btn-icon-sm" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                            <span style={{ fontSize: '0.85rem', color: product.stock > 0 ? 'var(--green)' : 'var(--red)', marginLeft: 12 }}>
                                {product.stock > 0 ? `${product.stock} disponíveis` : 'Indisponível'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                        <button className="btn btn-primary btn-lg" onClick={handleBuyNow} disabled={product.stock === 0} style={{ flex: 1, minWidth: 180 }}>
                            {product.stock > 0 ? '🛒 Comprar' : 'Indisponível'}
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1, minWidth: 180 }}>
                            Adicionar ao Carrinho
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <a href={`https://wa.me/5522999737366?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                            💬 Falar pelo WhatsApp
                        </a>
                        <button className="btn btn-ghost btn-sm" onClick={handleFavorite}>❤️ Favoritar</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copiado!'))}>📤 Compartilhar</button>
                    </div>

                    {/* Details */}
                    <div style={{ marginTop: 24, padding: '20px 0', borderTop: '1px solid var(--gray-800)' }}>
                        {product.warranty && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 8 }}>🛡️ Garantia: {product.warranty}</p>}
                        {product.pickup_available && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 8 }}>🏪 Retirada grátis na loja</p>}
                        {product.delivery_available && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 8 }}>🚚 Entrega disponível</p>}
                        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>💳 Pix, Crédito e Débito</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div style={{ background: 'var(--black-card)', border: '1px solid var(--gray-800)', borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 40 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>Descrição</h2>
                <p style={{ color: 'var(--gray-300)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{product.description}</p>
            </div>

            {/* Related */}
            {related.length > 0 && (
                <div>
                    <h2 className="section-title">Produtos Relacionados</h2>
                    <div className="products-grid" style={{ marginTop: 20 }}>
                        {related.map(p => {
                            const pr = p.promo_price || p.price;
                            const disc = p.promo_price ? Math.round((1 - p.promo_price / p.price) * 100) : 0;
                            return (
                                <Link to={`/produto/${p.id}`} key={p.id} className="product-card">
                                    {disc > 0 && <span className="product-discount-badge">-{disc}%</span>}
                                    <div className="product-image"><div className="product-image-placeholder">📱</div></div>
                                    <div className="product-info">
                                        <p className="product-brand">{p.brand}</p>
                                        <h3 className="product-name">{p.name}</h3>
                                        <div className="product-pricing">
                                            {p.promo_price && <span className="product-original-price">R$ {p.price.toFixed(2)}</span>}
                                            <span className="product-price">R$ {pr.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
        </div>
    );
}
