-- =====================================================================================
-- SCHEMA DE BANCO DE DADOS: HITCELL MACAÉ
-- PLATAFORMA: SUPABASE / POSTGRESQL
-- DESCRIÇÃO: Estrutura relacional completa baseada no IndexedDB da aplicação
-- =====================================================================================

-- 1. EXTENSÕES ÚTEIS (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELAS DE CONFIGURAÇÃO DO SITE E SISTEMA
CREATE TABLE site_settings (
    id TEXT PRIMARY KEY DEFAULT 'company', 
    name TEXT NOT NULL,
    tagline TEXT,
    phone TEXT,
    whatsapp TEXT,
    whatsapp_display TEXT,
    email TEXT,
    instagram TEXT,
    instagram_url TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    hours TEXT,
    hours_detail JSONB,
    map_lat DECIMAL(10,8),
    map_lng DECIMAL(11,8),
    allow_guest_checkout BOOLEAN DEFAULT true,
    delivery_enabled BOOLEAN DEFAULT true,
    delivery_regions JSONB,
    pickup_address TEXT,
    pickup_hours TEXT,
    warranty_policy TEXT,
    return_policy TEXT,
    privacy_policy TEXT,
    service_terms TEXT,
    purchase_terms TEXT,
    payment_methods JSONB,
    max_installments INT DEFAULT 12,
    session_timeout INT DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CRM E AUTENTICAÇÃO
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level INT NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    document TEXT,
    password_hash TEXT, -- Se usar auth externa (Supabase Auth), pode não ser necessário, mas útil para gestão interna
    role_id TEXT REFERENCES roles(id),
    type TEXT CHECK(type IN ('customer', 'employee', 'admin')) DEFAULT 'customer',
    privacy_consent BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    is_default BOOLEAN DEFAULT false
);

-- 4. CATÁLOGO DE PRODUTOS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    image TEXT,
    description TEXT,
    "order" INT DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand TEXT,
    model TEXT,
    compatibility JSONB DEFAULT '[]'::jsonb, 
    colors JSONB DEFAULT '[]'::jsonb,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    promo_price DECIMAL(10,2),
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    weight DECIMAL(10,2), -- Em gramas
    warranty TEXT,
    barcode TEXT,
    internal_code TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    sales_count INT DEFAULT 0,
    views INT DEFAULT 0,
    delivery_available BOOLEAN DEFAULT true,
    pickup_available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    active BOOLEAN DEFAULT true
);

-- 5. MOVIMENTAÇÃO DE ESTOQUE
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    type TEXT CHECK(type IN ('manual_add', 'manual_remove', 'pos_sale', 'ecommerce_sale', 'purchase', 'cancel_return', 'refund_return')),
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reason TEXT,
    order_id UUID,          -- Pode ser dependência de Order
    employee_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CUPONS E PROMOÇÕES
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_uses INT DEFAULT 0,
    used INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true
);

-- 7. PEDIDOS E PDV (Vendas)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id), 
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    channel TEXT CHECK(channel IN ('site', 'pos')) DEFAULT 'site',
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT CHECK(payment_status IN ('pending', 'approved', 'rejected', 'refunded')) DEFAULT 'pending',
    status TEXT CHECK(status IN ('pending_payment', 'payment_analysis', 'paid', 'separating', 'ready_pickup', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending_payment',
    delivery_type TEXT CHECK(delivery_type IN ('pickup', 'delivery')),
    shipping_address JSONB,
    coupon_code TEXT,
    history JSONB DEFAULT '[]'::jsonb, -- Armazena a timeline do pedido
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    name TEXT NOT NULL,
    variation TEXT, -- Cor, Tamanho, etc.
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ASSISTÊNCIA TÉCNICA (O.S. e Solicitações)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    problem TEXT NOT NULL,
    contact_preference TEXT,
    notes TEXT,
    status TEXT CHECK(status IN ('pending', 'contacted', 'converted', 'closed')) DEFAULT 'pending',
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES service_requests(id),
    number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    problem TEXT,
    accessories TEXT,
    physical_condition TEXT,
    diagnosis TEXT,
    service_performed TEXT,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    warranty TEXT,
    status TEXT CHECK(status IN ('received', 'device_received', 'evaluating', 'quote_sent', 'waiting_approval', 'approved', 'in_repair', 'waiting_parts', 'completed', 'ready_pickup', 'delivered', 'cancelled')),
    payment_status TEXT CHECK(payment_status IN ('pending', 'partial', 'approved')) DEFAULT 'pending',
    payment_method TEXT,
    technician UUID REFERENCES users(id),
    deadline TEXT,
    notes TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. FINANCEIRO (DRE)
CREATE TABLE cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opened_by UUID REFERENCES users(id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    opening_balance DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    closing_balance DECIMAL(10,2),
    status TEXT CHECK(status IN ('open', 'closed')) DEFAULT 'open'
);

CREATE TABLE revenues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT CHECK(type IN ('sale', 'pos_sale', 'service', 'other', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    order_id UUID,          -- Caso receita provenha de uma OP ou OS
    source TEXT,            -- Canal ou meio gerador
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT,          -- aluguel, fornecedor, salarios, marketing...
    due_date DATE,
    paid BOOLEAN DEFAULT false,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. INTEGRAÇÕES (Payments, APIs)
CREATE TABLE integrations (
    id TEXT PRIMARY KEY,
    name TEXT,
    provider TEXT,
    active BOOLEAN DEFAULT false,
    sandbox BOOLEAN DEFAULT true,
    keys JSONB,             -- Tokens de API, credenciais, public key.
    settings JSONB,         -- Flags: pix_enabled, max_installments...
    status TEXT DEFAULT 'disconnected'
);

-- 11. CMS (Conteúdo do Site)
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    bg_color TEXT,
    text_color TEXT,
    image_url TEXT,
    "order" INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'hero'
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    active BOOLEAN DEFAULT true
);

CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    "order" INT DEFAULT 0,
    active BOOLEAN DEFAULT true
);

CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INT CHECK(rating BETWEEN 1 AND 5) DEFAULT 5,
    active BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_content ( -- Diferenciais, blocos de serviços, info livre
    id TEXT PRIMARY KEY,
    type TEXT,
    items JSONB DEFAULT '[]'::jsonb
);

-- 12. AUDITORIA (Rastreio)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), 
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- FUNÇÕES DE AUTOMAÇÃO ÚTEIS (TRIGGERS)
-- Exemplo opcional: Atualizar o campo `updated_at` automaticamente
-- =====================================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER set_timestamp_service_orders
BEFORE UPDATE ON service_orders
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
