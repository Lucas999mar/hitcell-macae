export default function AdminPlaceholder({ title }) {
    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{title}</h1>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚧</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Módulo em Desenvolvimento</h2>
                <p style={{ color: 'var(--gray-400)', maxWidth: 400 }}>
                    Este módulo está sendo finalizado e estará disponível na próxima atualização do sistema.
                </p>
            </div>
        </div>
    );
}
