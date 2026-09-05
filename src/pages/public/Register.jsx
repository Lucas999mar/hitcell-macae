import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', privacy: false });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    function updateForm(field, value) { setForm(f => ({ ...f, [field]: value })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) { toast.error('Preencha todos os campos obrigatórios'); return; }
        if (form.password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
        if (form.password !== form.confirmPassword) { toast.error('As senhas não conferem'); return; }
        if (!form.privacy) { toast.error('Aceite a política de privacidade'); return; }

        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
            toast.success('Conta criada com sucesso!');
            navigate('/conta');
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    }

    return (
        <div className="container" style={{ maxWidth: 500, padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✨</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Criar Conta</h1>
                <p style={{ color: 'var(--gray-400)', marginTop: 8 }}>Cadastre-se na HitCell Macaé</p>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
                <div className="form-group">
                    <label className="form-label">Nome completo *</label>
                    <input type="text" className="form-input" placeholder="Seu nome" value={form.name} onChange={e => updateForm('name', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">E-mail *</label>
                    <input type="email" className="form-input" placeholder="seu@email.com" value={form.email} onChange={e => updateForm('email', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Telefone / WhatsApp</label>
                    <input type="tel" className="form-input" placeholder="(22) 99999-0000" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Senha *</label>
                        <input type="password" className="form-input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => updateForm('password', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirmar Senha *</label>
                        <input type="password" className="form-input" placeholder="Repita a senha" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
                    </div>
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
                    {loading ? 'Criando...' : 'Criar Conta'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                    Já tem conta? <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600 }}>Entrar</Link>
                </p>
            </div>
        </div>
    );
}
