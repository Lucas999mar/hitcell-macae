import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import db from '../../database/db';

export default function PageView({ slug: propSlug }) {
    const params = useParams();
    const slug = propSlug || params.slug;
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        db.query('pages', p => p.slug === slug && p.active).then(pages => {
            setPage(pages[0] || null);
            setLoading(false);
        });
    }, [slug]);

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;
    if (!page) return <div className="container section"><div className="empty-state"><div className="empty-state-icon">📄</div><p className="empty-state-title">Página não encontrada</p></div></div>;

    return (
        <div className="container" style={{ maxWidth: 800, padding: '40px 20px 60px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>{page.title}</h1>
            <div style={{ color: 'var(--gray-300)', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '0.95rem' }}>{page.content}</div>
        </div>
    );
}
