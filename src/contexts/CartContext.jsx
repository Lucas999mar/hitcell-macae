import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import db from '../database/db';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [coupon, setCouponState] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('hitcell_cart');
        if (stored) {
            try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
        }
        const storedCoupon = localStorage.getItem('hitcell_coupon');
        if (storedCoupon) {
            try { setCouponState(JSON.parse(storedCoupon)); } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('hitcell_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback(async (product, quantity = 1, variation = null) => {
        const prod = await db.getById('products', product.id);
        if (!prod || !prod.active) throw new Error('Produto indisponível');
        const availableStock = prod.stock;

        setItems(prev => {
            const key = product.id + (variation ? `-${variation}` : '');
            const existing = prev.find(i => i.key === key);
            if (existing) {
                const newQty = existing.quantity + quantity;
                if (newQty > availableStock) throw new Error(`Apenas ${availableStock} unidades disponíveis`);
                return prev.map(i => i.key === key ? { ...i, quantity: newQty } : i);
            }
            if (quantity > availableStock) throw new Error(`Apenas ${availableStock} unidades disponíveis`);
            return [...prev, {
                key,
                product_id: product.id,
                name: product.name,
                price: product.promo_price || product.price,
                original_price: product.price,
                image: product.images?.[0] || '',
                quantity,
                variation,
                max_stock: availableStock
            }];
        });
    }, []);

    const updateQuantity = useCallback(async (key, quantity) => {
        if (quantity < 1) return removeItem(key);
        const item = items.find(i => i.key === key);
        if (item) {
            const prod = await db.getById('products', item.product_id);
            if (prod && quantity > prod.stock) throw new Error(`Apenas ${prod.stock} unidades disponíveis`);
        }
        setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i));
    }, [items]);

    const removeItem = useCallback((key) => {
        setItems(prev => prev.filter(i => i.key !== key));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        setCouponState(null);
        localStorage.removeItem('hitcell_coupon');
    }, []);

    const applyCoupon = useCallback(async (code) => {
        const coupons = await db.getAll('coupons');
        const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
        if (!found) throw new Error('Cupom inválido');
        if (found.expires_at && new Date(found.expires_at) < new Date()) throw new Error('Cupom expirado');
        if (found.max_uses && found.used >= found.max_uses) throw new Error('Cupom esgotado');
        if (found.min_purchase && subtotal < found.min_purchase) {
            throw new Error(`Compra mínima de R$ ${found.min_purchase.toFixed(2)} para usar este cupom`);
        }
        setCouponState(found);
        localStorage.setItem('hitcell_coupon', JSON.stringify(found));
        return found;
    }, []);

    const removeCoupon = useCallback(() => {
        setCouponState(null);
        localStorage.removeItem('hitcell_coupon');
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const discount = coupon
        ? coupon.discount_type === 'percentage'
            ? subtotal * (coupon.discount_value / 100)
            : coupon.discount_type === 'fixed'
                ? coupon.discount_value
                : 0
        : 0;

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, itemCount, subtotal, discount, coupon,
            total: subtotal - discount,
            addItem, updateQuantity, removeItem, clearCart,
            applyCoupon, removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
