import { useState, useEffect } from 'react';
import db from '../../database/db';

export default function Contact() {
    const [settings, setSettings] = useState({});
    useEffect(() => { db.getById('settings', 'company').then(s => setSettings(s || {})); }, []);

    return (
        <div className="container" style={{ maxWidth: 800, padding: '40px 20px 60px' }}>
            <h1 className="section-title">📞 Contato</h1>
            <p className="section-subtitle">Entre em contato com a HitCell Macaé</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 40 }}>
                <a href="https://wa.me/5522999737366" target="_blank" rel="noopener noreferrer" className="card" style={{ textAlign: 'center', padding: 32, borderLeft: '3px solid #25d366', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>💬</span>
                    <h3 style={{ marginBottom: 8 }}>WhatsApp</h3>
                    <p style={{ color: 'var(--gray-400)' }}>({settings.whatsapp_display})</p>
                </a>
                <a href="https://instagram.com/hitcellmacae" target="_blank" rel="noopener noreferrer" className="card" style={{ textAlign: 'center', padding: 32, borderLeft: '3px solid #e1306c', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>📷</span>
                    <h3 style={{ marginBottom: 8 }}>Instagram</h3>
                    <p style={{ color: 'var(--gray-400)' }}>{settings.instagram}</p>
                </a>
                <div className="card" style={{ textAlign: 'center', padding: 32, borderLeft: '3px solid var(--red)' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>📍</span>
                    <h3 style={{ marginBottom: 8 }}>Endereço</h3>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>{settings.address}<br />{settings.neighborhood}, {settings.city} – {settings.state}</p>
                </div>
            </div>

            <div className="card" style={{ padding: 32 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>🕐 Horário de Funcionamento</h2>
                {settings.hours_detail?.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-800)', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: 600 }}>{h.day}</span>
                        <span style={{ color: h.time === 'Fechado' ? 'var(--red)' : 'var(--green)' }}>{h.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
