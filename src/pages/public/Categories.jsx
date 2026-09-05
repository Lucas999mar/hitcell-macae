import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../database/db';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    useEffect(() => { db.query('categories', c => c.active).then(c => setCategories(c.sort((a, b) => a.order - b.order))); }, []);

    return (
        <div className="container" style={{ padding: '30px 20px 60px' }}>
            <h1 className="section-title">📂 Categorias</h1>
            <p className="section-subtitle">Navegue por nossas categorias de produtos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {categories.map(c => (
                    <Link to={`/loja?categoria=${c.id}`} key={c.id} className="card" style={{ textAlign: 'center', padding: 32, textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>{c.icon}</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{c.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
