import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        setLoading(true);
        const [p, m] = await Promise.all([db.getAll('products'), db.getAll('inventory_movements')]);
        setProducts(p.filter(x => x.active).sort((a, b) => a.name.localeCompare(b.name)));
        setMovements(m.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setLoading(false);
    }

    const filteredMovements = movements.filter(m => {
        const d = new Date(m.created_at);
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (period === 'today') startDate.setHours(0, 0, 0, 0);
        else if (period === 'week') startDate.setDate(now.getDate() - 7);
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
        else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);
        else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
        else if (period === 'custom') {
            if (dateStart) startDate = new Date(dateStart + 'T00:00:00');
            else startDate = new Date(2000, 0, 1);
            if (dateEnd) endDate = new Date(dateEnd + 'T23:59:59');
        }

        if (period === 'custom') return d >= startDate && d <= endDate;
        return d >= startDate;
    });

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

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;

    const lowStock = products.filter(p => p.stock <= (p.min_stock || 5));
    const stockValue = products.reduce((s, p) => s + ((p.price || 0) * (p.stock || 0)), 0);
    const costValue = products.reduce((s, p) => s + ((p.cost || 0) * (p.stock || 0)), 0);

    const chartData = [
        { name: 'Valor Potencial (Preço Final)', valor: stockValue, cost: stockValue },
        { name: 'Custo Empatado (Compra)', cost: costValue, valor: costValue }
    ];

    return (
        <div className="animate-fade pb-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>📦 Painel de Estoque e Patrimônio</h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Gestão de capital imobilizado, reposições e movimentações</p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--black-card)', padding: '4px 8px', borderRadius: 'var(--radius-lg)' }}>
                        <input type="date" value={dateStart} onChange={e => { setDateStart(e.target.value); setPeriod('custom'); }} className="form-input" style={{ width: 130, padding: '4px 8px', height: 32, fontSize: '0.85rem' }} />
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>até</span>
                        <input type="date" value={dateEnd} onChange={e => { setDateEnd(e.target.value); setPeriod('custom'); }} className="form-input" style={{ width: 130, padding: '4px 8px', height: 32, fontSize: '0.85rem' }} />
                    </div>
                    <div className="tabs" style={{ background: 'var(--black-card)', padding: 4, margin: 0, borderRadius: 'var(--radius-lg)' }}>
                        <button className={`tab ${period === 'today' ? 'active' : ''}`} onClick={() => { setPeriod('today'); setDateStart(''); setDateEnd(''); }}>Hoje</button>
                        <button className={`tab ${period === 'week' ? 'active' : ''}`} onClick={() => { setPeriod('week'); setDateStart(''); setDateEnd(''); }}>7 Dias</button>
                        <button className={`tab ${period === 'month' ? 'active' : ''}`} onClick={() => { setPeriod('month'); setDateStart(''); setDateEnd(''); }}>30 Dias</button>
                        <button className={`tab ${period === 'quarter' ? 'active' : ''}`} onClick={() => { setPeriod('quarter'); setDateStart(''); setDateEnd(''); }}>Trimestre</button>
                        <button className={`tab ${period === 'year' ? 'active' : ''}`} onClick={() => { setPeriod('year'); setDateStart(''); setDateEnd(''); }}>Anual</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0))', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div className="stat-label">Produtos Ativos</div>
                    <div className="stat-value" style={{ color: 'var(--white)', fontSize: '1.8rem' }}>{products.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--blue)', marginTop: 8 }}>Cadastrados no catálogo</div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.1), rgba(0,0,0,0))', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <div className="stat-label">🚨 Risco de Ruptura (Gargalo)</div>
                    <div className="stat-value" style={{ color: 'var(--red)', fontSize: '1.8rem' }}>{lowStock.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>Itens abaixo do estoque mínimo</div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(0,0,0,0))', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div className="stat-label">Potencial de Faturamento</div>
                    <div className="stat-value" style={{ color: 'var(--white)', fontSize: '1.8rem' }}>R$ {stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: 8 }}>Valor de Venda Total Estimado</div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(0,0,0,0))', border: '1px solid rgba(234,179,8,0.2)' }}>
                    <div className="stat-label">Capital Empatado (Custo)</div>
                    <div className="stat-value" style={{ color: 'var(--yellow)', fontSize: '1.8rem' }}>R$ {costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 8 }}>Valor investido no estoque atual</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 24 }}>
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Relação Custo vs Valor Final (Margem do Portfólio)</h3>
                    <div style={{ height: 200, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="var(--gray-500)" fontSize={12} tickFormatter={v => `R$${v}`} />
                                <YAxis dataKey="name" type="category" stroke="var(--gray-300)" fontSize={12} width={200} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--black-card)', border: '1px solid var(--gray-700)', borderRadius: 8 }}
                                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Total']}
                                />
                                <Bar dataKey="valor" fill="var(--green)" radius={[0, 4, 4, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Gestão de Produtos</button>
                <button className={`tab ${tab === 'movements' ? 'active' : ''}`} onClick={() => setTab('movements')}>Histórico de Movimentações</button>
                <button className={`tab ${tab === 'low' ? 'active' : ''}`} onClick={() => setTab('low')}>Reposição Urgente ({lowStock.length})</button>
            </div>

            {tab === 'products' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>Produto</th><th>Marca</th><th>Custo un.</th><th>Preço Venda</th><th>Estoque</th><th>Alerta em</th><th>Potencial ($)</th><th>Ações</th></tr></thead>
                        <tbody>{products.map(p => (
                            <tr key={p.id}>
                                <td><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.internal_code}</div></td>
                                <td style={{ fontSize: '0.85rem' }}>{p.brand || '—'}</td>
                                <td style={{ fontSize: '0.85rem' }}>R$ {(p.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td><span style={{ fontWeight: 700, color: p.stock <= (p.min_stock || 5) ? 'var(--red)' : 'var(--green)' }}>{p.stock}</span></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{p.min_stock || 5} un</td>
                                <td style={{ fontSize: '0.85rem' }}>R$ {(p.price * p.stock).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td><button className="btn btn-secondary btn-sm" onClick={() => setShowMovement(p)}>📦 Movimentar</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 'movements' && (
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>Data/Hora</th><th>Produto</th><th>Natureza</th><th>Volumes</th><th>Saldo Anterior</th><th>Saldo Novo</th><th>Origem/Motivo</th></tr></thead>
                        <tbody>{filteredMovements.slice(0, 50).map(m => (
                            <tr key={m.id}>
                                <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                                <td style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.product_name}</td>
                                <td><span className={`badge ${m.type?.includes('add') || m.type?.includes('return') ? 'badge-green' : 'badge-red'}`}>{m.type?.includes('add') || m.type?.includes('return') ? '📥 Adição' : '📤 Baixa'}</span></td>
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
                        <thead><tr><th>Produto</th><th>Marca</th><th>Estoque Restante</th><th>Alerta Configurado</th><th>Ação Rápida</th></tr></thead>
                        <tbody>{lowStock.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                <td>{p.brand}</td>
                                <td><span style={{ color: 'var(--white)', fontWeight: 700, background: 'var(--red)', padding: '2px 8px', borderRadius: 4 }}>{p.stock} un</span></td>
                                <td>{p.min_stock || 5} un</td>
                                <td><button className="btn btn-primary btn-sm" onClick={() => { setMoveType('add'); setShowMovement(p); }}>📥 Inserir Compra</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {showMovement && (
                <div className="modal-overlay" onClick={() => setShowMovement(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">Lançamento de Estoque</h3><button className="modal-close" onClick={() => setShowMovement(null)}>✕</button></div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 16, fontWeight: 600 }}>{showMovement.name} — Estoque atual: <span style={{ color: 'var(--red)' }}>{showMovement.stock}</span></p>
                            <div className="form-group"><label className="form-label">Operação</label><select className="form-select" value={moveType} onChange={e => setMoveType(e.target.value)}><option value="add">📥 COMPRA / ENTRADA (+)</option><option value="remove">📤 AJUSTE / SAÍDA (-)</option></select></div>
                            <div className="form-group"><label className="form-label">Quantidade *</label><input type="number" className="form-input" value={moveQty} onChange={e => setMoveQty(e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">Nota Fiscal / Motivo</label><input type="text" className="form-input" value={moveReason} onChange={e => setMoveReason(e.target.value)} placeholder="Ex: NF 12345 / Fornecedor XYZ" /></div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowMovement(null)}>Cancelar</button><button className="btn btn-primary" onClick={doMovement}>Registrar Operação</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
