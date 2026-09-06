import { useState, useEffect } from 'react';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function AdminIntegrations() {
    const [integrations, setIntegrations] = useState({
        mercado_pago: { active: false, public_key: '', access_token: '' },
        infinity_pay: { active: false, api_key: '' },
    });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => { loadOptions(); }, []);

    async function loadOptions() {
        try {
            const settings = await db.getAll('settings');
            const integrationsSetting = settings.find(s => s.id === 'payments_integrations');
            if (integrationsSetting?.value) {
                setIntegrations(integrationsSetting.value);
            }
        } catch (error) {
            console.error("Failed to load integrations", error);
        }
        setLoading(false);
    }

    async function saveOptions() {
        try {
            const payload = { id: 'payments_integrations', value: integrations, type: 'json' };
            await db.put('settings', payload);
            toast.success('Integrações salvas com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar integrações');
            console.error(error);
        }
    }

    const handleChange = (provider, field, value) => {
        setIntegrations(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }));
    };

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>💳 Integrações de Pagamento</h1>
                <button className="btn btn-primary" onClick={saveOptions}>💾 Salvar Alterações</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {/* Mercado Pago */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-800)', paddingBottom: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#009EE3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>MP</div>
                            <div>
                                <h3 style={{ fontWeight: 700, margin: 0 }}>Mercado Pago</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', margin: 0 }}>Receba pagamentos via Pix, Boleto e Cartão de Crédito.</p>
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={integrations.mercado_pago.active} onChange={e => handleChange('mercado_pago', 'active', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    {integrations.mercado_pago.active && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="animate-fade">
                            <div>
                                <label className="form-label">Public Key</label>
                                <input type="text" className="form-input" value={integrations.mercado_pago.public_key} onChange={e => handleChange('mercado_pago', 'public_key', e.target.value)} placeholder="APP_USR-..." />
                            </div>
                            <div>
                                <label className="form-label">Access Token</label>
                                <input type="password" className="form-input" value={integrations.mercado_pago.access_token} onChange={e => handleChange('mercado_pago', 'access_token', e.target.value)} placeholder="APP_USR-..." />
                            </div>
                        </div>
                    )}
                </div>

                {/* Infinity Pay */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-800)', paddingBottom: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF', fontWeight: 'bold' }}>IP</div>
                            <div>
                                <h3 style={{ fontWeight: 700, margin: 0 }}>Infinity Pay</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', margin: 0 }}>Pagamentos por aproximação e taxas reduzidas no cartão.</p>
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={integrations.infinity_pay.active} onChange={e => handleChange('infinity_pay', 'active', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    {integrations.infinity_pay.active && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="animate-fade">
                            <div>
                                <label className="form-label">API Key</label>
                                <input type="password" className="form-input" value={integrations.infinity_pay.api_key} onChange={e => handleChange('infinity_pay', 'api_key', e.target.value)} placeholder="sk_live_..." />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
            .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--gray-700); transition: .3s; border-radius: 24px; }
            .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: var(--red); }
            input:checked + .slider:before { transform: translateX(20px); }
            `}</style>
        </div>
    );
}
