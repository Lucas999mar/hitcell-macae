import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import db from '../../database/db';

export default function OrderConfirmed() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    useEffect(() => { db.getById('orders', id).then(setOrder); }, [id]);

    if (!order) return <div className="page-loader"><div className="loader"></div></div>;

    return (
        <div className="container" style={{ maxWidth: 600, padding: '60px 20px', textAlign: 'center' }}>
            <div className="animate-bounce" style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Pedido Confirmado!</h1>
            <p style={{ color: 'var(--gray-400)', marginBottom: 30 }}>Seu pedido foi registrado com sucesso.</p>

            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: 'var(--gray-400)' }}>Nº do Pedido</span>
                    <span style={{ fontWeight: 700, color: 'var(--red)' }}>{order.number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: 'var(--gray-400)' }}>Total</span>
                    <span style={{ fontWeight: 700 }}>R$ {order.total?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: 'var(--gray-400)' }}>Pagamento</span>
                    <span>{order.payment_method === 'pix' ? 'Pix' : order.payment_method === 'credit_card' ? 'Cartão de Crédito' : 'Cartão de Débito'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-400)' }}>Entrega</span>
                    <span>{order.delivery_type === 'pickup' ? 'Retirada na Loja' : 'Entrega a domicílio'}</span>
                </div>
            </div>

            {order.payment_method === 'pix' && (
                <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
                    <h3 style={{ marginBottom: 12, fontWeight: 700 }}>📱 Pague com Pix</h3>
                    <div style={{ background: 'var(--white)', padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 12, display: 'inline-block' }}>
                        <div style={{ width: 180, height: 180, background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--black)', fontSize: '0.82rem' }}>QR Code Pix</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Copie o código abaixo:</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                        <input type="text" className="form-input" value={`PIX-${order.number}`} readOnly style={{ maxWidth: 280, textAlign: 'center' }} />
                        <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(`PIX-${order.number}`) }}>Copiar</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/loja" className="btn btn-primary">Continuar Comprando</Link>
                <a href={`https://wa.me/5522999737366?text=${encodeURIComponent(`Olá! Fiz o pedido ${order.number} e gostaria de mais informações.`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                    💬 WhatsApp
                </a>
            </div>

            <p style={{ marginTop: 24, fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                Acompanhe seu pedido em <Link to="/acompanhar-pedido" style={{ color: 'var(--red)' }}>Acompanhar Pedido</Link>
            </p>
        </div>
    );
}
