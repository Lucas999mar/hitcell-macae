import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        const c = await db.getAll('categories');
        setCategories(c.sort((a, b) => a.order - b.order));
    }

    function openNew() { setEditing({ name: '', slug: '', icon: '', desc: '', order: categories.length, featured: false, active: true }); setShowForm(true); }

    async function handleSave() {
        if (!editing.name) { toast.error('Nome é obrigatório'); return; }
        let data = { ...editing, slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
        await db.put('categories', data);
        toast.success('Categoria salva!');
        setShowForm(false);
        load();
    }

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📂 Categorias</h1>
                <button className="btn btn-primary" onClick={openNew}>+ Nova Categoria</button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead><tr><th>Ordem</th><th>Ícone</th><th>Nome</th><th>Destaque</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>{categories.map(c => (
                        <tr key={c.id}>
                            <td>{c.order}</td>
                            <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                            <td>{c.featured ? '⭐ Sim' : 'Não'}</td>
                            <td><span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Ativo' : 'Inativo'}</span></td>
                            <td><button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditing(c); setShowForm(true); }}>✏️</button></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>

            {showForm && editing && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">{editing.id ? 'Editar' : 'Nova'} Categoria</h3><button className="modal-close" onClick={() => setShowForm(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Nome *</label><input type="text" className="form-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Ícone (Emoji)</label><input type="text" className="form-input" value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Ordem</label><input type="number" className="form-input" value={editing.order} onChange={e => setEditing({ ...editing, order: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                                <label className="form-check"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /><span>Ativo</span></label>
                                <label className="form-check"><input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} /><span>Home</span></label>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Salvar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
