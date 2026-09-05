import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const toast = useToast();

    const emptyProduct = { name: '', description: '', category_id: '', brand: '', model: '', compatibility: [], colors: [], price: 0, cost: 0, promo_price: null, stock: 0, min_stock: 5, warranty: '', barcode: '', internal_code: '', active: true, featured: false, delivery_available: true, pickup_available: true, images: [], sales_count: 0 };

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        const [p, c] = await Promise.all([db.getAll('products'), db.query('categories', c => c.active)]);
        setProducts(p);
        setCategories(c.sort((a, b) => a.order - b.order));
    }

    function openEdit(product) { setEditing({ ...product, colors: product.colors || [], compatibility: product.compatibility || [] }); setShowForm(true); }
    function openNew() { setEditing({ ...emptyProduct }); setShowForm(true); }

    async function handleSave() {
        if (!editing.name) { toast.error('Nome é obrigatório'); return; }
        const slug = editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const data = { ...editing, slug, price: parseFloat(editing.price) || 0, cost: parseFloat(editing.cost) || 0, stock: parseInt(editing.stock) || 0, min_stock: parseInt(editing.min_stock) || 5, promo_price: editing.promo_price ? parseFloat(editing.promo_price) : null };
        await db.put('products', data);
        await db.put('audit_log', { user_id: 'admin', action: editing.id ? 'product_updated' : 'product_created', entity_type: 'product', entity_id: data.id, details: `Produto: ${data.name}` });
        toast.success(editing.id ? 'Produto atualizado!' : 'Produto criado!');
        setShowForm(false);
        loadAll();
    }

    async function toggleActive(p) {
        await db.put('products', { ...p, active: !p.active });
        toast.success(p.active ? 'Produto desativado' : 'Produto ativado');
        loadAll();
    }

    const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📦 Produtos ({products.length})</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" className="form-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
                    <button className="btn btn-primary" onClick={openNew}>+ Novo Produto</button>
                </div>
            </div>

            {/* Products Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Promoção</th>
                            <th>Estoque</th>
                            <th>Vendas</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => {
                            const cat = categories.find(c => c.id === p.category_id);
                            return (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{p.brand} | {p.internal_code}</div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>{cat?.name || '—'}</td>
                                    <td style={{ fontWeight: 600 }}>R$ {p.price?.toFixed(2)}</td>
                                    <td>{p.promo_price ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>R$ {p.promo_price.toFixed(2)}</span> : '—'}</td>
                                    <td><span style={{ color: p.stock <= (p.min_stock || 5) ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{p.stock}</span></td>
                                    <td>{p.sales_count || 0}</td>
                                    <td>
                                        <span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>
                                            {p.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-icon-sm" onClick={() => openEdit(p)} title="Editar">✏️</button>
                                            <button className="btn btn-ghost btn-icon-sm" onClick={() => toggleActive(p)} title={p.active ? 'Desativar' : 'Ativar'}>{p.active ? '🚫' : '✅'}</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            {showForm && editing && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editing.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Nome *</label>
                                    <input type="text" className="form-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Marca</label>
                                    <input type="text" className="form-input" value={editing.brand} onChange={e => setEditing({ ...editing, brand: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Descrição</label>
                                <textarea className="form-textarea" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Categoria</label>
                                    <select className="form-select" value={editing.category_id} onChange={e => setEditing({ ...editing, category_id: e.target.value })}>
                                        <option value="">Selecione...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Modelo</label>
                                    <input type="text" className="form-input" value={editing.model} onChange={e => setEditing({ ...editing, model: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Custo (R$)</label>
                                    <input type="number" step="0.01" className="form-input" value={editing.cost} onChange={e => setEditing({ ...editing, cost: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Preço (R$) *</label>
                                    <input type="number" step="0.01" className="form-input" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Preço Promocional</label>
                                    <input type="number" step="0.01" className="form-input" value={editing.promo_price || ''} onChange={e => setEditing({ ...editing, promo_price: e.target.value })} />
                                </div>
                            </div>
                            {editing.cost > 0 && editing.price > 0 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--green)', marginBottom: 16 }}>
                                    💰 Margem de Lucro: {((1 - editing.cost / editing.price) * 100).toFixed(1)}% | Lucro: R$ {(editing.price - editing.cost).toFixed(2)}
                                </p>
                            )}
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Estoque</label>
                                    <input type="number" className="form-input" value={editing.stock} onChange={e => setEditing({ ...editing, stock: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Estoque Mínimo</label>
                                    <input type="number" className="form-input" value={editing.min_stock} onChange={e => setEditing({ ...editing, min_stock: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Garantia</label>
                                    <input type="text" className="form-input" value={editing.warranty} onChange={e => setEditing({ ...editing, warranty: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Cód. Interno</label>
                                    <input type="text" className="form-input" value={editing.internal_code} onChange={e => setEditing({ ...editing, internal_code: e.target.value })} />
                                </div>
                                <div className="form-group"><label className="form-label">Cód. Barras</label>
                                    <input type="text" className="form-input" value={editing.barcode} onChange={e => setEditing({ ...editing, barcode: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Cores (separadas por vírgula)</label>
                                <input type="text" className="form-input" value={editing.colors?.join(', ')} onChange={e => setEditing({ ...editing, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                            </div>
                            <div className="form-group"><label className="form-label">Compatibilidade (separados por vírgula)</label>
                                <input type="text" className="form-input" value={editing.compatibility?.join(', ')} onChange={e => setEditing({ ...editing, compatibility: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                            </div>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                <label className="form-check"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /><span>Ativo</span></label>
                                <label className="form-check"><input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} /><span>Destaque</span></label>
                                <label className="form-check"><input type="checkbox" checked={editing.delivery_available} onChange={e => setEditing({ ...editing, delivery_available: e.target.checked })} /><span>Entrega</span></label>
                                <label className="form-check"><input type="checkbox" checked={editing.pickup_available} onChange={e => setEditing({ ...editing, pickup_available: e.target.checked })} /><span>Retirada</span></label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Salvar Produto</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
