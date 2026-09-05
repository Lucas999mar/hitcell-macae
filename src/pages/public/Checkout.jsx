import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import db from '../../database/db';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Checkout() {
    const { items, subtotal, discount, coupon, total, clearCart } = useCart();
    const { user, isLoggedIn } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({});
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
        document: '', address: '', neighborhood: '', city: 'Macaé', state: 'RJ', zip: '',
        delivery_type: 'pickup', delivery_region: '', payment_method: 'pix',
        terms: false, notes: ''
    });

    useEffect(() => {
        if (items.length === 0) navigate('/carrinho');
        db.getById('settings', 'company').then(s => setSettings(s || {}));
        if (user) setForm(f => ({ ...f, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
    }, []);

    function updateForm(k, v) { setForm(f => ({ ...f, [k]: v })); }

    const deliveryFee = form.delivery_type === 'pickup' ? 0 :
        (settings.delivery_regions?.find(r => r.name === form.delivery_region)?.price || 0);
    const grandTotal = total + deliveryFee;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone) { toast.error('Preencha seus dados'); return; }
        if (form.delivery_type === 'delivery' && (!form.address || !form.neighborhood)) { toast.error('Preencha o endereço de entrega'); return; }
        if (!form.terms) { toast.error('Aceite os termos de compra'); return; }

        setLoading(true);
        try {
            // Create/update customer
            let customerId = user?.id;
            if (!customerId) {
                const existing = await db.query('customers', c => c.email === form.email);
                if (existing.length > 0) {
                    customerId = existing[0].id;
                } else {
                    const newCust = await db.put('customers', {
                        name: form.name, email: form.email, phone: form.phone,
                        document: form.document, whatsapp: form.phone, privacy_consent: true,
                        privacy_consent_date: new Date().toISOString()
                    });
                    customerId = newCust.id;
                }
            }

            // Create order
            const orderNum = `HC${Date.now().toString(36).toUpperCase()}`;
            const order = await db.put('orders', {
                number: orderNum, customer_id: customerId,
                customer_name: form.name, customer_email: form.email, customer_phone: form.phone,
                items: items.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity, variation: i.variation })),
                subtotal, discount, coupon_code: coupon?.code || null,
                delivery_type: form.delivery_type, delivery_fee: deliveryFee,
                delivery_region: form.delivery_region,
                delivery_address: form.delivery_type === 'delivery' ? `${form.address}, ${form.neighborhood}, ${form.city} - ${form.state}` : null,
                total: grandTotal, payment_method: form.payment_method,
                status: 'pending_payment', payment_status: 'pending',
                channel: 'website', notes: form.notes,
                history: [{ action: 'Pedido criado', date: new Date().toISOString(), by: 'sistema' }]
            });

            // Reserve stock
            for (const item of items) {
                const prod = await db.getById('products', item.product_id);
                if (prod) {
                    await db.put('products', { ...prod, stock: Math.max(0, prod.stock - item.quantity) });
                    await db.put('inventory_movements', {
                        product_id: item.product_id, product_name: prod.name,
                        type: 'reserve', quantity: item.quantity,
                        stock_before: prod.stock, stock_after: Math.max(0, prod.stock - item.quantity),
                        reason: `Reserva para pedido ${orderNum}`, order_id: order.id,
                        employee_id: 'sistema'
                    });
                }
            }

            // Create payment record
            await db.put('payments', {
                order_id: order.id, customer_id: customerId,
                amount: grandTotal, method: form.payment_method,
                status: 'pending', transaction_code: `TXN-${Date.now()}`,
                installments: 1, gross_amount: grandTotal, fee: 0, net_amount: grandTotal
            });

            // Update coupon usage
            if (coupon) {
                const c = await db.getById('coupons', coupon.id);
                if (c) await db.put('coupons', { ...c, used: (c.used || 0) + 1 });
            }

            clearCart();
            toast.success('Pedido realizado com sucesso!');
            navigate(`/pedido-confirmado/${order.id}`);
        } catch (err) {
            toast.error('Erro ao processar pedido: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="container" style={{ padding: '30px 20px 60px', maxWidth: 900 }}>
            <h1 className="section-title">Finalizar Compra</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 30 }} className="cart-layout">
                    <div>
                        {/* Step 1: Customer Data */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>👤 Dados do Cliente</h3>
                            <div className="form-group">
                                <label className="form-label">Nome *</label>
                                <input type="text" className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">E-mail *</label>
                                    <input type="email" className="form-input" value={form.email} onChange={e => updateForm('email', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Telefone *</label>
                                    <input type="tel" className="form-input" value={form.phone} onChange={e => updateForm('phone', e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">CPF (opcional)</label>
                                <input type="text" className="form-input" value={form.document} onChange={e => updateForm('document', e.target.value)} />
                            </div>
                        </div>

                        {/* Step 2: Delivery */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🚚 Entrega</h3>
                            <div className="form-group">
                                <label className="form-label">Tipo de entrega</label>
                                <select className="form-select" value={form.delivery_type} onChange={e => updateForm('delivery_type', e.target.value)}>
                                    <option value="pickup">🏪 Retirada na Loja (Grátis)</option>
                                    <option value="delivery">🚚 Entrega a domicílio</option>
                                </select>
                            </div>
                            {form.delivery_type === 'pickup' && (
                                <div style={{ padding: 16, background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    <p style={{ fontWeight: 600, marginBottom: 4 }}>📍 Retirada Grátis</p>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--gray-400)' }}>{settings.pickup_address}</p>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: 4 }}>{settings.pickup_hours}</p>
                                </div>
                            )}
                            {form.delivery_type === 'delivery' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Região</label>
                                        <select className="form-select" value={form.delivery_region} onChange={e => updateForm('delivery_region', e.target.value)}>
                                            <option value="">Selecione...</option>
                                            {settings.delivery_regions?.map(r => (
                                                <option key={r.name} value={r.name}>{r.name} – {r.price === 0 ? 'Grátis' : `R$ ${r.price.toFixed(2)}`} ({r.days} dia{r.days !== 1 ? 's' : ''})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Endereço *</label>
                                        <input type="text" className="form-input" placeholder="Rua, número" value={form.address} onChange={e => updateForm('address', e.target.value)} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Bairro *</label>
                                            <input type="text" className="form-input" value={form.neighborhood} onChange={e => updateForm('neighborhood', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">CEP</label>
                                            <input type="text" className="form-input" value={form.zip} onChange={e => updateForm('zip', e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Step 3: Payment */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>💳 Pagamento</h3>
                            <div className="form-group">
                                <label className="form-label">Forma de Pagamento</label>
                                <select className="form-select" value={form.payment_method} onChange={e => updateForm('payment_method', e.target.value)}>
                                    <option value="pix">📱 Pix (5% de desconto)</option>
                                    <option value="credit_card">💳 Cartão de Crédito</option>
                                    <option value="debit_card">💳 Cartão de Débito</option>
                                </select>
                            </div>
                            {form.payment_method === 'pix' && (
                                <div style={{ padding: 16, background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--gray-400)' }}>O código Pix será gerado após a confirmação do pedido.</p>
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="card">
                            <label className="form-check">
                                <input type="checkbox" checked={form.terms} onChange={e => updateForm('terms', e.target.checked)} />
                                <span style={{ fontSize: '0.88rem', color: 'var(--gray-400)' }}>
                                    Li e concordo com os <Link to="/pagina/termos-compra" style={{ color: 'var(--red)' }}>Termos de Compra</Link> e a <Link to="/pagina/privacidade" style={{ color: 'var(--red)' }}>Política de Privacidade</Link>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 56px)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Resumo do Pedido</h3>
                            {items.map(item => (
                                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.88rem' }}>
                                    <span style={{ color: 'var(--gray-300)' }}>{item.quantity}x {item.name}</span>
                                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}><span style={{ color: 'var(--gray-400)' }}>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}><span style={{ color: 'var(--green)' }}>Desconto</span><span style={{ color: 'var(--green)' }}>-R$ {discount.toFixed(2)}</span></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}><span style={{ color: 'var(--gray-400)' }}>Frete</span><span>{deliveryFee === 0 ? <span style={{ color: 'var(--green)' }}>Grátis</span> : `R$ ${deliveryFee.toFixed(2)}`}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--gray-800)', fontWeight: 800, fontSize: '1.15rem' }}><span>Total</span><span style={{ color: 'var(--green)' }}>R$ {grandTotal.toFixed(2)}</span></div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} disabled={loading}>
                                {loading ? 'Processando...' : `Confirmar Pedido – R$ ${grandTotal.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
