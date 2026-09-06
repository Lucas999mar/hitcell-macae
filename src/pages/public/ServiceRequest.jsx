import { useState } from 'react';
import { Link } from 'react-router-dom';
import db from '../../database/db';
import { useToast } from '../../contexts/ToastContext';

export default function ServiceRequest() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', brand: '', model: '', problem: '', notes: '', contact_preference: 'whatsapp', privacy: false });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useToast();

    function updateForm(k, v) { setForm(f => ({ ...f, [k]: v })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.phone || !form.brand || !form.model || !form.problem) { toast.error('Preencha os campos obrigatórios'); return; }
        if (!form.privacy) { toast.error('Aceite a política de privacidade'); return; }
        setLoading(true);
        try {
            const payload = { ...form, status: 'pending' };
            delete payload.privacy; // Remove visual control to avoid DB schema conflict

            payload.history = [{ action: 'Solicitação recebida pelo site', date: new Date().toISOString() }];

            await db.put('service_requests', payload);
            toast.success('Solicitação enviada com sucesso!');
            setSubmitted(true);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    }

    const services = [
        { icon: '📱', title: 'Troca de Tela', desc: 'Telas originais e compatíveis' },
        { icon: '🔋', title: 'Troca de Bateria', desc: 'Baterias de alta qualidade' },
        { icon: '🔌', title: 'Conector de Carga', desc: 'Reparo de conector USB-C/Lightning' },
        { icon: '💧', title: 'Dano por Líquido', desc: 'Recuperação de aparelhos molhados' },
        { icon: '🔧', title: 'Reparo de Placa', desc: 'Microsoldagem especializada' },
        { icon: '📸', title: 'Câmera', desc: 'Troca de câmeras frontal/traseira' },
        { icon: '🔊', title: 'Áudio', desc: 'Alto-falante e microfone' },
        { icon: '⚙️', title: 'Software', desc: 'Formatação e atualização' },
    ];

    const brands = ['Apple (iPhone)', 'Samsung', 'Motorola', 'Xiaomi', 'Huawei', 'LG', 'ASUS', 'OnePlus', 'Nokia', 'Outra'];

    if (submitted) {
        return (
            <div className="container" style={{ maxWidth: 500, padding: '60px 20px', textAlign: 'center' }}>
                <div className="animate-bounce" style={{ fontSize: '4rem', marginBottom: 20 }}>✅</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Solicitação Enviada!</h1>
                <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>Recebemos sua solicitação. Nossa equipe entrará em contato em breve para agendar o atendimento.</p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 24 }}>⚠️ Esta solicitação não constitui diagnóstico definitivo. O diagnóstico será realizado presencialmente.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/" className="btn btn-primary">Voltar ao Início</Link>
                    <a href="https://wa.me/5522999737366" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">💬 WhatsApp</a>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '30px 20px 60px' }}>
            <h1 className="section-title">🔧 Assistência Técnica</h1>
            <p className="section-subtitle">Especialistas no conserto do seu celular</p>

            {/* Services Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 50 }}>
                {services.map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center', padding: 20 }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>{s.icon}</span>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{s.title}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{s.desc}</p>
                    </div>
                ))}
            </div>

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 50 }}>
                <div className="card" style={{ borderLeft: '3px solid var(--green)' }}>
                    <h3 style={{ marginBottom: 8 }}>✅ Diagnóstico Gratuito</h3>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Avaliamos seu aparelho sem custo. Você só paga se autorizar o serviço.</p>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--blue)' }}>
                    <h3 style={{ marginBottom: 8 }}>🛡️ Garantia de 90 Dias</h3>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Todos os nossos serviços possuem garantia de peças e mão de obra.</p>
                </div>
                <div className="card" style={{ borderLeft: '3px solid var(--yellow)' }}>
                    <h3 style={{ marginBottom: 8 }}>⚡ Agilidade</h3>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Troca de tela e bateria no mesmo dia. Serviços complexos em até 5 dias.</p>
                </div>
            </div>

            {/* Request Form */}
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Solicitar Atendimento</h2>
                <p style={{ textAlign: 'center', color: 'var(--gray-400)', marginBottom: 30, fontSize: '0.9rem' }}>Preencha o formulário abaixo e entraremos em contato</p>

                <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Nome *</label>
                            <input type="text" className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefone *</label>
                            <input type="tel" className="form-input" placeholder="(22) 99999-0000" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input type="email" className="form-input" value={form.email} onChange={e => updateForm('email', e.target.value)} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Marca do Aparelho *</label>
                            <select className="form-select" value={form.brand} onChange={e => updateForm('brand', e.target.value)}>
                                <option value="">Selecione...</option>
                                {brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Modelo *</label>
                            <input type="text" className="form-input" placeholder="Ex: iPhone 14 Pro" value={form.model} onChange={e => updateForm('model', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Problema informado *</label>
                        <textarea className="form-textarea" placeholder="Descreva o problema do seu aparelho" value={form.problem} onChange={e => updateForm('problem', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Observações</label>
                        <textarea className="form-textarea" placeholder="Informações adicionais" value={form.notes} onChange={e => updateForm('notes', e.target.value)} style={{ minHeight: 60 }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Melhor forma de contato</label>
                        <select className="form-select" value={form.contact_preference} onChange={e => updateForm('contact_preference', e.target.value)}>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="phone">Ligação</option>
                            <option value="email">E-mail</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-check">
                            <input type="checkbox" checked={form.privacy} onChange={e => updateForm('privacy', e.target.checked)} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
                                Li e concordo com a <Link to="/pagina/privacidade" style={{ color: 'var(--red)' }}>Política de Privacidade</Link>
                            </span>
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 12 }}>Ou fale diretamente conosco:</p>
                    <a href="https://wa.me/5522999737366?text=Ol%C3%A1!%20Preciso%20de%20assist%C3%AAncia%20t%C3%A9cnica." target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                        💬 Falar pelo WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
