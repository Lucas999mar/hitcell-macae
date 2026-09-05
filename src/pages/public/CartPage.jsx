import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

export default function CartPage() {
    const { items, itemCount, subtotal, discount, coupon, total, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [deliveryType, setDeliveryType] = useState('pickup');
    const toast = useToast();
    const navigate = useNavigate();

    async function handleApplyCoupon() {
        try {
            await applyCoupon(couponCode);
            toast.success('Cupom aplicado!');
            setCouponCode('');
        } catch (err) { toast.error(err.message); }
    }

    async function handleUpdateQty(key, delta) {
        const item = items.find(i => i.key === key);
        if (item) {
            try { await updateQuantity(key, item.quantity + delta); }
            catch (err) { toast.error(err.message); }
        }
    }

    if (items.length === 0) {
        return (
            <div className="container section">
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <p className="empty-state-title">Seu carrinho está vazio</p>
                    <p className="empty-state-text">Adicione produtos para continuar com a compra.</p>
                    <Link to="/loja" className="btn btn-primary">Ir para a Loja</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '30px 20px 60px' }}>
            <h1 className="section-title">🛒 Carrinho de Compras</h1>
            <p className="section-subtitle">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30 }} className="cart-layout">
                {/* Items */}
                <div>
                    {items.map(item => (
                        <div key={item.key} style={{ display: 'flex', gap: 16, padding: 20, background: 'var(--black-card)', border: '1px solid var(--gray-800)', borderRadius: 'var(--radius-lg)', marginBottom: 12, alignItems: 'center' }} className="cart-item">
                            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                                📱
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Link to={`/produto/${item.product_id}`} style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: 4 }}>{item.name}</Link>
                                {item.variation && <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>Cor: {item.variation}</p>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                    <button className="btn btn-secondary btn-icon-sm" onClick={() => handleUpdateQty(item.key, -1)}>−</button>
                                    <span style={{ fontWeight: 700, width: 30, textAlign: 'center' }}>{item.quantity}</span>
                                    <button className="btn btn-secondary btn-icon-sm" onClick={() => handleUpdateQty(item.key, 1)}>+</button>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {item.original_price !== item.price && <p style={{ textDecoration: 'line-through', color: 'var(--gray-500)', fontSize: '0.82rem' }}>R$ {(item.original_price * item.quantity).toFixed(2)}</p>}
                                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green)' }}>R$ {(item.price * item.quantity).toFixed(2)}</p>
                                <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.82rem', cursor: 'pointer', marginTop: 4 }}>Remover</button>
                            </div>
                        </div>
                    ))}
                    <button onClick={clearCart} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>🗑️ Limpar carrinho</button>
                </div>

                {/* Summary */}
                <div>
                    <div style={{ background: 'var(--black-card)', border: '1px solid var(--gray-800)', borderRadius: 'var(--radius-lg)', padding: 24, position: 'sticky', top: 'calc(var(--header-height) + 56px)' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Resumo</h3>

                        {/* Coupon */}
                        <div style={{ marginBottom: 20 }}>
                            {coupon ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--green)' }}>🏷️ {coupon.code}</span>
                                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.82rem', cursor: 'pointer' }}>Remover</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input type="text" className="form-input" placeholder="Cupom de desconto" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ flex: 1 }} />
                                    <button className="btn btn-secondary btn-sm" onClick={handleApplyCoupon}>Aplicar</button>
                                </div>
                            )}
                        </div>

                        {/* Delivery */}
                        <div style={{ marginBottom: 20 }}>
                            <label className="form-label">Entrega</label>
                            <select className="form-select" value={deliveryType} onChange={e => setDeliveryType(e.target.value)}>
                                <option value="pickup">🏪 Retirada na Loja (Grátis)</option>
                                <option value="delivery">🚚 Entrega a domicílio</option>
                            </select>
                            {deliveryType === 'pickup' && <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: 6 }}>Rua Alcides Mourão, 350 – Aroeira</p>}
                        </div>

                        <div style={{ borderTop: '1px solid var(--gray-800)', paddingTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--gray-400)' }}>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--green)' }}>Desconto</span>
                                    <span style={{ color: 'var(--green)' }}>-R$ {discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--gray-400)' }}>Frete</span>
                                <span style={{ color: 'var(--green)' }}>{deliveryType === 'pickup' ? 'Grátis' : 'A calcular'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--gray-800)', fontSize: '1.2rem', fontWeight: 800 }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--green)' }}>R$ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} onClick={() => navigate('/checkout')}>
                            Finalizar Compra →
                        </button>
                        <Link to="/loja" className="btn btn-ghost btn-full btn-sm" style={{ marginTop: 8 }}>
                            ← Continuar Comprando
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
          .cart-item { flex-direction: column; text-align: center; }
        }
      `}</style>
        </div>
    );
}
