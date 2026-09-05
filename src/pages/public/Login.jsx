import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAdmin } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email || !password) { toast.error('Preencha todos os campos'); return; }
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Bem-vindo, ${user.name}!`);
            if (user.type === 'employee') navigate('/admin');
            else navigate('/conta');
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    }

    return (
        <div className="container" style={{ maxWidth: 440, padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔐</div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Entrar</h1>
                <p style={{ color: 'var(--gray-400)', marginTop: 8 }}>Acesse sua conta HitCell Macaé</p>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
                <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input type="email" className="form-input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Senha</label>
                    <input type="password" className="form-input" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                    Não tem conta? <Link to="/registro" style={{ color: 'var(--red)', fontWeight: 600 }}>Criar conta</Link>
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: 30, padding: 20, background: 'var(--black-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-800)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                    Acesso Admin: admin@hitcell.com / admin123
                </p>
            </div>
        </div>
    );
}
