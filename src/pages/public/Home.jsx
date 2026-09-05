import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import db from '../../database/db';
import './Home.css';

export default function Home() {
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [promoProducts, setPromoProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [differentials, setDifferentials] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [settings, setSettings] = useState({});
    const [currentBanner, setCurrentBanner] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    async function loadData() {
        const [bnrs, cats, prods, srvContent, diffContent, tests, faqItems, sett] = await Promise.all([
            db.query('banners', b => b.active),
            db.query('categories', c => c.active),
            db.query('products', p => p.active),
            db.getById('site_content', 'services'),
            db.getById('site_content', 'differentials'),
            db.query('testimonials', t => t.active && t.approved),
            db.query('faq', f => f.active),
            db.getById('settings', 'company')
        ]);
        setBanners(bnrs.sort((a, b) => a.order - b.order));
        setCategories(cats.filter(c => c.featured).sort((a, b) => a.order - b.order));
        setPromoProducts(prods.filter(p => p.promo_price && p.stock > 0).slice(0, 8));
        setBestSellers([...prods].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 8));
        setNewProducts([...prods].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8));
        setServices(srvContent?.items || []);
        setDifferentials(diffContent?.items || []);
        setTestimonials(tests);
        setFaqs(faqItems.sort((a, b) => a.order - b.order));
        setSettings(sett || {});
    }

    return (
        <div className="home">
            {/* Hero Banner */}
            <section className="hero">
                {banners.map((banner, i) => (
                    <div
                        key={banner.id}
                        className={`hero-slide ${i === currentBanner ? 'active' : ''}`}
                        style={{ background: banner.bg_color || '#1a1a1a' }}
                    >
                        <div className="container hero-content">
                            <div className="hero-text">
                                <h1 className="hero-title">{banner.title}</h1>
                                <p className="hero-subtitle">{banner.subtitle}</p>
                                {banner.cta_text && (
                                    <Link to={banner.cta_link || '/loja'} className="btn btn-primary btn-lg">
                                        {banner.cta_text} →
                                    </Link>
                                )}
                            </div>
                            <div className="hero-visual">
                                <div className="hero-phone-icon">📱</div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="hero-dots">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            className={`hero-dot ${i === currentBanner ? 'active' : ''}`}
                            onClick={() => setCurrentBanner(i)}
                        />
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="section quick-actions">
                <div className="container">
                    <div className="quick-grid">
                        <Link to="/assistencia" className="quick-card">
                            <div className="quick-icon" style={{ background: 'rgba(220,38,38,0.15)' }}>🔧</div>
                            <h3>Assistência Técnica</h3>
                            <p>Diagnóstico gratuito e serviço com garantia</p>
                        </Link>
                        <Link to="/loja" className="quick-card">
                            <div className="quick-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>🛒</div>
                            <h3>Comprar Acessórios</h3>
                            <p>Capas, películas, carregadores e mais</p>
                        </Link>
                        <Link to="/acompanhar-pedido" className="quick-card">
                            <div className="quick-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>📦</div>
                            <h3>Acompanhar Pedido</h3>
                            <p>Consulte o status da sua compra</p>
                        </Link>
                        <Link to="/acompanhar-servico" className="quick-card">
                            <div className="quick-icon" style={{ background: 'rgba(234,179,8,0.15)' }}>🔍</div>
                            <h3>Acompanhar Serviço</h3>
                            <p>Veja o andamento do seu reparo</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Categorias em Destaque</h2>
                    <p className="section-subtitle">Encontre o que você precisa</p>
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <Link to={`/loja?categoria=${cat.id}`} key={cat.id} className="category-card">
                                <span className="category-icon">{cat.icon}</span>
                                <span className="category-name">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promo Products */}
            {promoProducts.length > 0 && (
                <section className="section section-promo">
                    <div className="container">
                        <div className="section-header-row">
                            <div>
                                <h2 className="section-title">🔥 Promoções</h2>
                                <p className="section-subtitle">Ofertas imperdíveis por tempo limitado</p>
                            </div>
                            <Link to="/loja?promo=true" className="btn btn-outline btn-sm">Ver Todas →</Link>
                        </div>
                        <div className="products-grid">
                            {promoProducts.map(prod => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Best Sellers */}
            <section className="section">
                <div className="container">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">⭐ Mais Vendidos</h2>
                            <p className="section-subtitle">Os favoritos dos nossos clientes</p>
                        </div>
                        <Link to="/loja?ordem=mais-vendidos" className="btn btn-outline btn-sm">Ver Todos →</Link>
                    </div>
                    <div className="products-grid">
                        {bestSellers.map(prod => (
                            <ProductCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </div>
            </section>

            {/* New Products */}
            <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="container">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">✨ Novidades</h2>
                            <p className="section-subtitle">Acabou de chegar na HitCell</p>
                        </div>
                        <Link to="/loja?ordem=novidades" className="btn btn-outline btn-sm">Ver Todos →</Link>
                    </div>
                    <div className="products-grid">
                        {newProducts.map(prod => (
                            <ProductCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Nossos Serviços</h2>
                    <p className="section-subtitle">Soluções completas para seu celular</p>
                    <div className="services-grid">
                        {services.map((srv, i) => (
                            <div key={i} className="service-card">
                                <span className="service-icon">{srv.icon}</span>
                                <h3 className="service-title">{srv.title}</h3>
                                <p className="service-desc">{srv.description}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 30 }}>
                        <Link to="/assistencia" className="btn btn-primary btn-lg">Solicitar Atendimento →</Link>
                    </div>
                </div>
            </section>

            {/* Differentials */}
            <section className="section section-diff">
                <div className="container">
                    <h2 className="section-title">Por que escolher a HitCell?</h2>
                    <p className="section-subtitle">Excelência em cada detalhe</p>
                    <div className="diff-grid">
                        {differentials.map((diff, i) => (
                            <div key={i} className="diff-card">
                                <span className="diff-icon">{diff.icon}</span>
                                <h3>{diff.title}</h3>
                                <p>{diff.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Warranty Info */}
            <section className="section">
                <div className="container">
                    <div className="warranty-banner">
                        <div className="warranty-content">
                            <h2>🛡️ Garantia em Todos os Serviços</h2>
                            <p>{settings.warranty_policy || 'Todos os serviços possuem garantia de 90 dias.'}</p>
                            <Link to="/pagina/garantia" className="btn btn-outline">Saiba Mais</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="container">
                        <h2 className="section-title">O que dizem nossos clientes</h2>
                        <p className="section-subtitle">Depoimentos reais de clientes satisfeitos</p>
                        <div className="testimonials-grid">
                            {testimonials.map(t => (
                                <div key={t.id} className="testimonial-card">
                                    <div className="testimonial-stars">{'⭐'.repeat(t.rating)}</div>
                                    <p className="testimonial-text">"{t.text}"</p>
                                    <p className="testimonial-name">{t.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Perguntas Frequentes</h2>
                    <p className="section-subtitle">Tire suas dúvidas</p>
                    <div className="faq-list">
                        {faqs.map(faq => (
                            <FaqItem key={faq.id} faq={faq} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Location */}
            <section className="section section-location">
                <div className="container">
                    <div className="location-grid">
                        <div className="location-info">
                            <h2 className="section-title">Nossa Loja</h2>
                            <p className="location-address">
                                📍 {settings.address}<br />
                                {settings.neighborhood}, {settings.city} – {settings.state}
                            </p>
                            <p className="location-hours">
                                🕐 {settings.hours}
                            </p>
                            <p className="location-phone">
                                📱 {settings.whatsapp_display}
                            </p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address + ', ' + settings.city + ' ' + settings.state)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{ marginTop: 16 }}
                            >
                                📍 Ver no Google Maps
                            </a>
                        </div>
                        <div className="location-map">
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent('Rua Alcides Mourão 350 Aroeira Macaé RJ')}`}
                                width="100%" height="350" style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                                allowFullScreen loading="lazy" title="HitCell Macaé"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Instagram CTA */}
            <section className="section" style={{ textAlign: 'center' }}>
                <div className="container">
                    <h2 className="section-title">Siga a HitCell no Instagram</h2>
                    <p className="section-subtitle">Fique por dentro das novidades</p>
                    <a href="https://instagram.com/hitcellmacae" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                        📷 @hitcellmacae
                    </a>
                </div>
            </section>

            {/* WhatsApp CTA */}
            <section className="section whatsapp-cta">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Precisa de ajuda?</h2>
                    <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>Fale conosco pelo WhatsApp. Atendimento rápido e personalizado!</p>
                    <a href="https://wa.me/5522999737366" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                        💬 Falar pelo WhatsApp
                    </a>
                </div>
            </section>
        </div>
    );
}

function ProductCard({ product }) {
    const discount = product.promo_price
        ? Math.round((1 - product.promo_price / product.price) * 100)
        : 0;
    const price = product.promo_price || product.price;

    return (
        <Link to={`/produto/${product.id}`} className="product-card">
            {discount > 0 && <span className="product-discount-badge">-{discount}%</span>}
            {product.stock === 0 && <span className="product-unavailable-badge">Indisponível</span>}
            <div className="product-image">
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                ) : (
                    <div className="product-image-placeholder">📱</div>
                )}
            </div>
            <div className="product-info">
                <p className="product-brand">{product.brand}</p>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-pricing">
                    {product.promo_price && (
                        <span className="product-original-price">R$ {product.price.toFixed(2)}</span>
                    )}
                    <span className="product-price">R$ {price.toFixed(2)}</span>
                    <span className="product-installments">
                        ou {Math.min(12, Math.floor(price / 10))}x de R$ {(price / Math.min(12, Math.floor(price / 10))).toFixed(2)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function FaqItem({ faq }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
            <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-toggle">{open ? '−' : '+'}</span>
            </div>
            {open && <div className="faq-answer">{faq.answer}</div>}
        </div>
    );
}
