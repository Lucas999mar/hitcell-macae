import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminStock() {
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [tab, setTab] = useState('products');
    const [showMovement, setShowMovement] = useState(null);
    const [moveQty, setMoveQty] = useState(0);
    const [moveReason, setMoveReason] = useState('');
    const [moveType, setMoveType] = useState('add');
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        const [p, m] = await Promise.all([db.getAll('products'), db.getAll('inventory_movements')]);
        setProducts(p.filter(x => x.active).sort((a, b) => a.name.localeCompare(b.name)));
        setMovements(m.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }

    async function doMovement() {
        if (!moveQty || moveQty <= 0) { toast.error('Quantidade inválida'); return; }
        const prod = showMovement;
        const qty = parseInt(moveQty);
        const newStock = moveType === 'add' ? prod.stock + qty : Math.max(0, prod.stock - qty);
        await db.put('products', { ...prod, stock: newStock });
        await db.put('inventory_movements', { product_id: prod.id, product_name: prod.name, type: moveType === 'add' ? 'manual_add' : 'manual_remove', quantity: qty, stock_before: prod.stock, stock_after: newStock, reason: moveReason || (moveType === 'add' ? 'Entrada manual' : 'Saída manual'), employee_id: 'admin' });
        await db.put('audit_log', { user_id: 'admin', action: 'stock_movement', entity_type: 'product', entity_id: prod.id, details: `${moveType === 'add' ? 'Entrada' : 'Saída'} de ${qty}un. de ${prod.name}` });
        toast.success('Movimentação registrada!');
        setShowMovement(null); setMoveQty(0); setMoveReason('');
        load();
    }

    const lowStock = products.filter(p => p.stock <= (p.min_stock || 5));
    const stockValue = products.reduce((s, p) => s + ((p.price || 0) * (p.stock || 0)), 0);
    const costValue = products.reduce((s, p) => s + ((p.cost || 0) * (p.stock || 0)), 0);

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>📊 Estoque</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}>📦</div><div className="stat-value" style={{ color: 'var(--blue)' }}>{products.length}</div><div className="stat-label">Produtos Ativos</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(220,38,38,0.15)', color: 'var(--red)' }}>⚠️</div><div className="stat-value" style={{ color: 'var(--red)' }}>{lowStock.length}</div><div className="stat-label">Estoque Baixo</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}>💰</div><div className="stat-value" style={{ color: 'var(--green)' }}>R$ {stockValue.toFixed(0)}</div><div className="stat-label">Valor Venda</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(234,179,8,0.15)', color: 'var(--yellow)' }}>📊</div><div className="stat-value" style={{ color: 'var(--yellow)' }}>R$ {costValue.toFixed(0)}</div><div className="stat-label">Valor Custo</div></div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Produtos</button>
                <button className={`tab ${tab === 'movements' ? 'active' : ''}`} onClick={() => setTab('movements')}>Movimentações</button>
                <button className={`tab ${tab === 'low' ? 'active' : ''}`} onClick={() => setTab('low')}>Estoque Baixo ({lowStock.length})</button>
            </div>

            {tab === 'products' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>Produto</th><th>Marca</th><th>Custo</th><th>Preço</th><th>Estoque</th><th>Mínimo</th><th>Valor</th><th>Ações</th></tr></thead>
                        <tbody>{products.map(p => (
                            <tr key={p.id}>
                                <td><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.internal_code}</div></td>
                                <td style={{ fontSize: '0.85rem' }}>{p.brand || '—'}</td>
                                <td style={{ fontSize: '0.85rem' }}>R$ {(p.cost || 0).toFixed(2)}</td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>R$ {p.price.toFixed(2)}</td>
                                <td><span style={{ fontWeight: 700, color: p.stock <= (p.min_stock || 5) ? 'var(--red)' : 'var(--green)' }}>{p.stock}</span></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{p.min_stock || 5}</td>
                                <td style={{ fontSize: '0.85rem' }}>R$ {(p.price * p.stock).toFixed(2)}</td>
                                <td><button className="btn btn-secondary btn-sm" onClick={() => setShowMovement(p)}>📦 Movimentar</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 'movements' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Antes</th><th>Depois</th><th>Motivo</th></tr></thead>
                        <tbody>{movements.slice(0, 50).map(m => (
                            <tr key={m.id}>
                                <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                                <td style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.product_name}</td>
                                <td><span className={`badge ${m.type?.includes('add') || m.type?.includes('return') ? 'badge-green' : 'badge-red'}`}>{m.type?.includes('add') || m.type?.includes('return') ? '📥 Entrada' : '📤 Saída'}</span></td>
                                <td style={{ fontWeight: 700 }}>{m.quantity}</td>
                                <td style={{ fontSize: '0.85rem' }}>{m.stock_before}</td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.stock_after}</td>
                                <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{m.reason}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 'low' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>Produto</th><th>Marca</th><th>Estoque</th><th>Mínimo</th><th>Ações</th></tr></thead>
                        <tbody>{lowStock.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                <td>{p.brand}</td>
                                <td><span style={{ color: 'var(--red)', fontWeight: 700 }}>{p.stock}</span></td>
                                <td>{p.min_stock || 5}</td>
                                <td><button className="btn btn-primary btn-sm" onClick={() => { setMoveType('add'); setShowMovement(p); }}>📥 Repor</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {showMovement && (
                <div className="modal-overlay" onClick={() => setShowMovement(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">Movimentar Estoque</h3><button className="modal-close" onClick={() => setShowMovement(null)}>✕</button></div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 16, fontWeight: 600 }}>{showMovement.name} — Estoque atual: <span style={{ color: 'var(--red)' }}>{showMovement.stock}</span></p>
                            <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={moveType} onChange={e => setMoveType(e.target.value)}><option value="add">📥 Entrada</option><option value="remove">📤 Saída</option></select></div>
                            <div className="form-group"><label className="form-label">Quantidade *</label><input type="number" className="form-input" value={moveQty} onChange={e => setMoveQty(e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Motivo</label><input type="text" className="form-input" value={moveReason} onChange={e => setMoveReason(e.target.value)} placeholder="Ex: Compra fornecedor" /></div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowMovement(null)}>Cancelar</button><button className="btn btn-primary" onClick={doMovement}>Confirmar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
