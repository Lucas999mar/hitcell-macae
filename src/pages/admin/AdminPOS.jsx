import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminPOS() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState(0);
    const toast = useToast();

    useEffect(() => { db.query('products', p => p.active && p.stock > 0).then(setProducts); }, []);

    const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search) || p.internal_code?.toLowerCase().includes(search.toLowerCase()));

    function addToCart(product) {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) { toast.error('Estoque insuficiente'); return prev; }
                return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product_id: product.id, name: product.name, price: product.promo_price || product.price, cost: product.cost || 0, quantity: 1, max_stock: product.stock }];
        });
    }

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal - discount;

    async function finalizeSale() {
        if (cart.length === 0) { toast.error('Adicione produtos'); return; }
        if (!customerName) { toast.error('Informe o nome do cliente'); return; }

        const orderNum = `POS${Date.now().toString(36).toUpperCase()}`;
        const order = await db.put('orders', {
            number: orderNum, customer_name: customerName, customer_phone: customerPhone,
            items: cart.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity })),
            subtotal, discount, total, payment_method: paymentMethod,
            status: 'paid', payment_status: 'approved', channel: 'pos',
            delivery_type: 'pickup',
            history: [{ action: 'Venda no balcão', date: new Date().toISOString(), by: 'admin' }]
        });

        for (const item of cart) {
            const prod = await db.getById('products', item.product_id);
            if (prod) {
                await db.put('products', { ...prod, stock: Math.max(0, prod.stock - item.quantity), sales_count: (prod.sales_count || 0) + item.quantity });
                await db.put('inventory_movements', { product_id: item.product_id, product_name: prod.name, type: 'pos_sale', quantity: item.quantity, stock_before: prod.stock, stock_after: Math.max(0, prod.stock - item.quantity), reason: `Venda balcão ${orderNum}`, order_id: order.id, employee_id: 'admin' });
            }
        }

        await db.put('revenues', { order_id: order.id, type: 'pos_sale', amount: total, description: `Venda balcão ${orderNum}`, channel: 'pos' });
        await db.put('payments', { order_id: order.id, amount: total, method: paymentMethod, status: 'approved', transaction_code: `POS-${Date.now()}` });
        await db.put('audit_log', { user_id: 'admin', action: 'pos_sale', entity_type: 'order', entity_id: order.id, details: `Venda balcão ${orderNum}: R$ ${total.toFixed(2)}` });

        toast.success(`Venda ${orderNum} finalizada! Total: R$ ${total.toFixed(2)}`);
        setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscount(0);
        db.query('products', p => p.active && p.stock > 0).then(setProducts);
    }

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>💰 Venda no Balcão (PDV)</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }} className="cart-layout">
                <div>
                    <input type="text" className="form-input" placeholder="🔍 Buscar produto por nome, código ou código de barras..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                        {filtered.slice(0, 20).map(p => (
                            <button key={p.id} onClick={() => addToCart(p)} className="card" style={{ textAlign: 'left', padding: 12, cursor: 'pointer', border: '1px solid var(--gray-800)', background: 'var(--black-card)' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{p.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>R$ {(p.promo_price || p.price).toFixed(2)}</span>
                                    <span style={{ color: p.stock <= (p.min_stock || 5) ? 'var(--red)' : 'var(--gray-400)' }}>{p.stock} un.</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🧾 Venda Atual</h3>

                    <div className="form-group">
                        <label className="form-label">Cliente *</label>
                        <input type="text" className="form-input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do cliente" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Telefone</label>
                        <input type="tel" className="form-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                    </div>

                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 20 }}>Nenhum produto adicionado</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.85rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                                        <button className="btn btn-secondary btn-icon-sm" style={{ width: 24, height: 24, fontSize: '0.75rem' }} onClick={() => setCart(prev => item.quantity <= 1 ? prev.filter(i => i.product_id !== item.product_id) : prev.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity - 1 } : i))}>−</button>
                                        <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                                        <button className="btn btn-secondary btn-icon-sm" style={{ width: 24, height: 24, fontSize: '0.75rem' }} onClick={() => { if (item.quantity < item.max_stock) setCart(prev => prev.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i)); else toast.error('Estoque insuficiente'); }}>+</button>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600 }}>R$ {(item.price * item.quantity).toFixed(2)}</div>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setCart(prev => prev.filter(i => i.product_id !== item.product_id))}>Remover</button>
                                </div>
                            </div>
                        ))
                    )}

                    <div style={{ marginTop: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Desconto (R$)</label>
                            <input type="number" step="0.01" className="form-input" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Forma de Pagamento</label>
                            <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="cash">💵 Dinheiro</option>
                                <option value="pix">📱 Pix</option>
                                <option value="credit_card">💳 Crédito</option>
                                <option value="debit_card">💳 Débito</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--gray-800)', paddingTop: 12, marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.9rem' }}><span style={{ color: 'var(--gray-400)' }}>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                        {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.9rem' }}><span style={{ color: 'var(--green)' }}>Desconto</span><span style={{ color: 'var(--green)' }}>-R$ {discount.toFixed(2)}</span></div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.3rem', marginTop: 8 }}><span>Total</span><span style={{ color: 'var(--green)' }}>R$ {total.toFixed(2)}</span></div>
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 16 }} onClick={finalizeSale} disabled={cart.length === 0}>
                        ✅ Finalizar Venda
                    </button>
                </div>
            </div>
        </div>
    );
}
