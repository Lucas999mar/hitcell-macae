import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminSite() {
    const [tab, setTab] = useState('banners');
    const [banners, setBanners] = useState([]);
    const [pages, setPages] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('');
    const [editing, setEditing] = useState(null);
    const toast = useToast();

    useEffect(() => { load(); }, []);
    async function load() {
        const [b, p, f] = await Promise.all([db.getAll('banners'), db.getAll('pages'), db.getAll('faq')]);
        setBanners(b.sort((a, b) => a.order - b.order)); setPages(p); setFaqs(f.sort((a, b) => a.order - b.order));
    }

    function openNew(type) {
        setFormType(type);
        if (type === 'banner') setEditing({ title: '', subtitle: '', image: '', bg_color: '#1a1a1a', cta_text: '', cta_link: '', order: banners.length, active: true });
        if (type === 'page') setEditing({ title: '', slug: '', content: '', active: true });
        if (type === 'faq') setEditing({ question: '', answer: '', order: faqs.length, active: true });
        setShowForm(true);
    }

    async function handleSave() {
        const store = formType === 'banner' ? 'banners' : formType === 'page' ? 'pages' : 'faq';
        if (!editing.title && !editing.question) { toast.error('Preencha os dados'); return; }

        let data = { ...editing };
        if (formType === 'page' && !data.slug) data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        await db.put(store, data);
        toast.success('Salvo com sucesso!');
        setShowForm(false);
        load();
    }

    async function toggleActive(item, store) { await db.put(store, { ...item, active: !item.active }); toast.success('Status alterado'); load(); }

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>🌐 Gerenciar Site</h1>

            <div className="tabs" style={{ marginBottom: 24 }}>
                <button className={`tab ${tab === 'banners' ? 'active' : ''}`} onClick={() => setTab('banners')}>Banners</button>
                <button className={`tab ${tab === 'pages' ? 'active' : ''}`} onClick={() => setTab('pages')}>Páginas</button>
                <button className={`tab ${tab === 'faq' ? 'active' : ''}`} onClick={() => setTab('faq')}>FAQ</button>
            </div>

            {tab === 'banners' && (
                <div>
                    <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => openNew('banner')}>+ Novo Banner</button>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Ordem</th><th>Título</th><th>CTA</th><th>Cores</th><th>Status</th><th>Ações</th></tr></thead>
                            <tbody>{banners.map(b => (
                                <tr key={b.id}>
                                    <td>{b.order}</td>
                                    <td><div style={{ fontWeight: 600 }}>{b.title}</div><div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{b.subtitle}</div></td>
                                    <td>{b.cta_text || '—'}</td>
                                    <td><div style={{ width: 24, height: 24, borderRadius: 4, background: b.bg_color }}></div></td>
                                    <td><span className={`badge ${b.active ? 'badge-green' : 'badge-gray'}`}>{b.active ? 'Ativo' : 'Inativo'}</span></td>
                                    <td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost btn-icon-sm" onClick={() => { setFormType('banner'); setEditing(b); setShowForm(true); }}>✏️</button><button className="btn btn-ghost btn-icon-sm" onClick={() => toggleActive(b, 'banners')}>{b.active ? '🚫' : '✅'}</button></div></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'pages' && (
                <div>
                    <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => openNew('page')}>+ Nova Página</button>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Título</th><th>URL (Slug)</th><th>Status</th><th>Ações</th></tr></thead>
                            <tbody>{pages.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                                    <td style={{ color: 'var(--gray-400)' }}>/pagina/{p.slug}</td>
                                    <td><span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>{p.active ? 'Ativo' : 'Inativo'}</span></td>
                                    <td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-ghost btn-icon-sm" onClick={() => { setFormType('page'); setEditing(p); setShowForm(true); }}>✏️</button><button className="btn btn-ghost btn-icon-sm" onClick={() => toggleActive(p, 'pages')}>{p.active ? '🚫' : '✅'}</button></div></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && editing && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">{editing.id ? 'Editar' : 'Novo'} {formType}</h3><button className="modal-close" onClick={() => setShowForm(false)}>✕</button></div>
                        <div className="modal-body">
                            {formType === 'banner' && (
                                <>
                                    <div className="form-group"><label className="form-label">Título *</label><input type="text" className="form-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Subtítulo</label><input type="text" className="form-input" value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Texto CTA</label><input type="text" className="form-input" value={editing.cta_text} onChange={e => setEditing({ ...editing, cta_text: e.target.value })} /></div>
                                        <div className="form-group"><label className="form-label">Link CTA</label><input type="text" className="form-input" value={editing.cta_link} onChange={e => setEditing({ ...editing, cta_link: e.target.value })} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Cor Fundo</label><input type="color" className="form-input" value={editing.bg_color} onChange={e => setEditing({ ...editing, bg_color: e.target.value })} /></div>
                                        <div className="form-group"><label className="form-label">Ordem</label><input type="number" className="form-input" value={editing.order} onChange={e => setEditing({ ...editing, order: e.target.value })} /></div>
                                    </div>
                                </>
                            )}
                            {formType === 'page' && (
                                <>
                                    <div className="form-group"><label className="form-label">Título *</label><input type="text" className="form-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">URL Slug (vazio = automático)</label><input type="text" className="form-input" value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Conteúdo (Pode usar HTML/Markdown se suportado)</label><textarea className="form-textarea" value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} style={{ minHeight: 200 }} /></div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Salvar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
