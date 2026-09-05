-- =====================================================================================
-- DADOS INICIAIS (SEED) PARA O SUPABASE - HITCELL MACAÉ
-- Execute este arquivo no SQL Editor do Supabase logo após criar as tabelas
-- =====================================================================================

-- 1. CONFIGURAÇÕES DA EMPRESA
INSERT INTO site_settings (id, name, tagline, phone, whatsapp, whatsapp_display, email, instagram, instagram_url, address, neighborhood, city, state, zip, hours, map_lat, map_lng, allow_guest_checkout, delivery_enabled, pickup_address, pickup_hours, warranty_policy, return_policy, privacy_policy, service_terms, purchase_terms, max_installments, session_timeout)
VALUES (
    'company', 'HitCell Macaé', 'Assistência Técnica e Acessórios', '(22) 99973-7366', '5522999737366', '(22) 99973-7366', 'contato@hitcellmacae.com.br', '@hitcellmacae', 'https://instagram.com/hitcellmacae', 'Rua Alcides Mourão, 350', 'Aroeira', 'Macaé', 'RJ', '27933-000', 'Seg a Sex: 9h às 18h | Sáb: 9h às 13h', -22.3768, -41.7869, true, true, 'Rua Alcides Mourão, 350 – Aroeira, Macaé – RJ', 'Seg a Sex: 9h às 18h | Sáb: 9h às 13h', 'Todos os serviços de assistência técnica possuem garantia de 90 dias.', 'Trocas podem ser realizadas em até 7 dias.', 'A HitCell Macaé se compromete com a proteção dos dados.', 'O cliente autoriza a abertura e diagnóstico do aparelho.', 'O cliente concorda com os termos de compra.', 12, 30
) ON CONFLICT (id) DO NOTHING;

-- 2. CARGOS E PERMISSÕES (ROLES)
INSERT INTO roles (id, name, level, permissions) VALUES 
('role-admin', 'Administrador', 100, '["all"]'),
('role-manager', 'Gerente', 80, '["products", "orders", "customers", "inventory", "services", "financial", "reports", "site", "employees"]'),
('role-seller', 'Vendedor', 40, '["products.view", "orders", "customers", "pos", "inventory.view"]'),
('role-tech', 'Técnico', 40, '["services", "inventory.view", "inventory.use"]'),
('role-stock', 'Estoquista', 30, '["inventory", "products.view", "suppliers"]'),
('role-financial', 'Financeiro', 50, '["financial", "reports", "orders.view", "payments"]')
ON CONFLICT (id) DO NOTHING;

-- 3. USUÁRIO ADMINISTRATIVO (LOGIN PADRÃO)
INSERT INTO users (id, name, email, password_hash, role_id, type, active)
VALUES (
    -- ID fixo para facilidade de relacionamento
    '00000000-0000-0000-0000-000000000001', 
    'Administrador HitCell', 
    'admin@hitcell.com', 
    'admin123', 
    'role-admin', 
    'admin', 
    true
) ON CONFLICT (id) DO NOTHING;

-- 4. CATEGORIAS DE PRODUTOS PADRÃO
INSERT INTO categories (id, name, slug, icon, "order", featured, active) VALUES
('11111111-1111-1111-1111-111111111111', 'Capas e Cases', 'capas-cases', '🛡️', 1, true, true),
('22222222-2222-2222-2222-222222222222', 'Películas', 'peliculas', '📱', 2, true, true),
('33333333-3333-3333-3333-333333333333', 'Carregadores', 'carregadores', '🔌', 3, true, true),
('44444444-4444-4444-4444-444444444444', 'Fones de Ouvido', 'fones-ouvido', '🎧', 4, true, true)
ON CONFLICT (id) DO NOTHING;

-- 5. BANNERS DA HOME
INSERT INTO banners (title, subtitle, cta_text, cta_link, bg_color, text_color, "order", active, type) VALUES
('Assistência Técnica Especializada', 'Seu celular em boas mãos. Diagnóstico gratuito!', 'Solicitar Atendimento', '/assistencia', '#1a1a1a', '#ffffff', 1, true, 'hero'),
('Acessórios com até 30% OFF', 'Capas, películas, carregadores e muito mais', 'Ver Ofertas', '/loja', '#dc2626', '#ffffff', 2, true, 'hero');

-- 6. CAIXA INICIAL DO FINANCEIRO
INSERT INTO cash_registers (id, opened_by, opening_balance, current_balance, status)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000001', 
    0.00, 
    0.00, 
    'open'
) ON CONFLICT (id) DO NOTHING;

-- FIM. O sistema está agora 100% pronto para uso via Supabase Cloud!
