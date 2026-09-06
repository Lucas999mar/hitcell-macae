import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo" style={{ textDecoration: 'none' }}>
                            <img src="/images/logo-wide.png" alt="HitCell Macaé" style={{ height: 56, objectFit: 'contain', marginBottom: 8 }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            <div style={{ display: 'none', flexDirection: 'column' }}>
                                <div><span className="logo-hit">Hit</span><span className="logo-cell">Cell</span></div>
                                <span className="footer-logo-sub">Macaé</span>
                            </div>
                        </Link>
                        <p className="footer-desc">
                            Assistência técnica especializada e acessórios para celulares em Macaé.
                            Qualidade, confiança e preço justo.
                        </p>
                        <div className="footer-social">
                            <a href="https://wa.me/5522999737366" target="_blank" rel="noopener noreferrer" className="footer-social-link whatsapp">💬 WhatsApp</a>
                            <a href="https://www.instagram.com/hitcellmacae_?stkn=cDJ1Z3EwcnQ2cjFq" target="_blank" rel="noopener noreferrer" className="footer-social-link instagram" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram
                            </a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Links Rápidos</h4>
                        <Link to="/" className="footer-link">Início</Link>
                        <Link to="/loja" className="footer-link">Loja</Link>
                        <Link to="/assistencia" className="footer-link">Assistência Técnica</Link>
                        <Link to="/categorias" className="footer-link">Categorias</Link>
                        <Link to="/sobre" className="footer-link">Sobre a HitCell</Link>
                        <Link to="/contato" className="footer-link">Contato</Link>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Políticas</h4>
                        <Link to="/pagina/garantia" className="footer-link">Política de Garantia</Link>
                        <Link to="/pagina/trocas" className="footer-link">Política de Troca</Link>
                        <Link to="/pagina/privacidade" className="footer-link">Política de Privacidade</Link>
                        <Link to="/pagina/termos-atendimento" className="footer-link">Termos de Atendimento</Link>
                        <Link to="/pagina/termos-compra" className="footer-link">Termos de Compra</Link>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Contato</h4>
                        <div className="footer-info">
                            <span>📍</span>
                            <span>Rua Alcides Mourão, 350<br />Aroeira, Macaé – RJ</span>
                        </div>
                        <div className="footer-info">
                            <span>📱</span>
                            <span>(22) 99973-7366</span>
                        </div>
                        <div className="footer-info">
                            <span>🕐</span>
                            <span>Seg a Sex: 9h às 18h<br />Sáb: 9h às 13h</span>
                        </div>
                        <div className="footer-payments">
                            <h4 className="footer-title" style={{ marginTop: 16 }}>Formas de Pagamento</h4>
                            <div className="footer-payment-icons">
                                <span className="payment-icon">💳 Crédito</span>
                                <span className="payment-icon">💳 Débito</span>
                                <span className="payment-icon">📱 Pix</span>
                                <span className="payment-icon">💵 Dinheiro</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} HitCell Macaé — Assistência Técnica e Acessórios. Todos os direitos reservados.</p>
                    <p className="footer-privacy">
                        Este site respeita a sua privacidade conforme a <Link to="/pagina/privacidade">LGPD</Link>.
                    </p>
                </div>
            </div>
        </footer>
    );
}
