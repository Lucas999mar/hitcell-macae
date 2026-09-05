import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminSettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => { db.getById('settings', 'company').then(s => setSettings(s || {})); }, []);

    function updateSet(k, v) { setSettings(s => ({ ...s, [k]: v })); }

    async function handleSave() {
        setLoading(true);
        await db.put('settings', { id: 'company', ...settings });
        toast.success('Configurações salvas!');
        setLoading(false);
    }

    return (
        <div className="animate-fade">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>⚙️ Configurações Gerais</h1>

            <div className="card" style={{ maxWidth: 800 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Empresa</h3>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Nome da Empresa</label><input type="text" className="form-input" value={settings.name || ''} onChange={e => updateSet('name', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">CNPJ</label><input type="text" className="form-input" value={settings.document || ''} onChange={e => updateSet('document', e.target.value)} /></div>
                </div>

                <h3 style={{ fontWeight: 700, marginTop: 24, marginBottom: 16 }}>Contato & Redes Sociais</h3>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">E-mail Contato</label><input type="email" className="form-input" value={settings.email || ''} onChange={e => updateSet('email', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">WhatsApp (Display)</label><input type="text" className="form-input" value={settings.whatsapp_display || ''} onChange={e => updateSet('whatsapp_display', e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Link Instagram</label><input type="text" className="form-input" value={settings.instagram || ''} onChange={e => updateSet('instagram', e.target.value)} /></div>

                <h3 style={{ fontWeight: 700, marginTop: 24, marginBottom: 16 }}>Endereço e Retirada</h3>
                <div className="form-group"><label className="form-label">Endereço Principal</label><input type="text" className="form-input" value={settings.address || ''} onChange={e => updateSet('address', e.target.value)} /></div>
                <div className="form-row">
                    <div className="form-group"><label className="form-label">Bairro</label><input type="text" className="form-input" value={settings.neighborhood || ''} onChange={e => updateSet('neighborhood', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Cidade</label><input type="text" className="form-input" value={settings.city || ''} onChange={e => updateSet('city', e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Instruções de Retirada (Pickup)</label><input type="text" className="form-input" value={settings.pickup_address || ''} onChange={e => updateSet('pickup_address', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Horários de Retirada</label><input type="text" className="form-input" value={settings.pickup_hours || ''} onChange={e => updateSet('pickup_hours', e.target.value)} /></div>

                <h3 style={{ fontWeight: 700, marginTop: 24, marginBottom: 16 }}>Políticas</h3>
                <div className="form-group"><label className="form-label">Política de Garantia Padrão</label><textarea className="form-textarea" value={settings.warranty_policy || ''} onChange={e => updateSet('warranty_policy', e.target.value)} /></div>

                <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }} onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar Configurações'}</button>
            </div>
        </div>
    );
}
