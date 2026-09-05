import db from './db.js';

const SEED_KEY = 'hitcell_seeded_v3';

export async function seedDatabase() {
    if (localStorage.getItem(SEED_KEY)) return;

    // Settings
    await db.put('settings', {
        id: 'company',
        name: 'HitCell Macaé',
        tagline: 'Assistência Técnica e Acessórios',
        phone: '(22) 99973-7366',
        whatsapp: '5522999737366',
        whatsapp_display: '(22) 99973-7366',
        email: 'contato@hitcellmacae.com.br',
        instagram: '@hitcellmacae',
        instagram_url: 'https://instagram.com/hitcellmacae',
        address: 'Rua Alcides Mourão, 350',
        neighborhood: 'Aroeira',
        city: 'Macaé',
        state: 'RJ',
        zip: '27933-000',
        hours: 'Seg a Sex: 9h às 18h | Sáb: 9h às 13h',
        hours_detail: [
            { day: 'Segunda a Sexta', time: '09:00 - 18:00' },
            { day: 'Sábado', time: '09:00 - 13:00' },
            { day: 'Domingo e Feriados', time: 'Fechado' }
        ],
        map_lat: -22.3768,
        map_lng: -41.7869,
        allow_guest_checkout: true,
        delivery_enabled: true,
        delivery_regions: [
            { name: 'Centro', price: 5.00, days: 1 },
            { name: 'Aroeira', price: 0, days: 0 },
            { name: 'Imbetiba', price: 7.00, days: 1 },
            { name: 'Cavaleiros', price: 10.00, days: 1 },
            { name: 'Granja dos Cavaleiros', price: 12.00, days: 2 },
            { name: 'Virgem Santa', price: 8.00, days: 1 }
        ],
        pickup_address: 'Rua Alcides Mourão, 350 – Aroeira, Macaé – RJ',
        pickup_hours: 'Seg a Sex: 9h às 18h | Sáb: 9h às 13h',
        warranty_policy: 'Todos os serviços de assistência técnica possuem garantia de 90 dias. Acessórios possuem garantia conforme o fabricante.',
        return_policy: 'Trocas podem ser realizadas em até 7 dias após a compra, com o produto em perfeitas condições e nota fiscal.',
        privacy_policy: 'A HitCell Macaé se compromete com a proteção dos dados pessoais dos clientes conforme a LGPD.',
        service_terms: 'Ao solicitar um serviço de assistência técnica, o cliente autoriza a abertura e diagnóstico do aparelho.',
        purchase_terms: 'Ao efetuar uma compra, o cliente concorda com os termos de compra e política de troca da HitCell Macaé.',
        payment_methods: ['pix', 'credit_card', 'debit_card', 'cash'],
        max_installments: 12,
        session_timeout: 30
    });

    // Admin user
    await db.put('users', {
        id: 'admin-001',
        name: 'Administrador',
        email: 'admin@hitcell.com',
        password: 'admin123',
        role: 'admin',
        active: true,
        type: 'employee'
    });

    // Roles
    const roles = [
        { id: 'role-admin', name: 'Administrador', level: 100, permissions: ['all'] },
        { id: 'role-manager', name: 'Gerente', level: 80, permissions: ['products', 'orders', 'customers', 'inventory', 'services', 'financial', 'reports', 'site', 'employees'] },
        { id: 'role-seller', name: 'Vendedor', level: 40, permissions: ['products.view', 'orders', 'customers', 'pos', 'inventory.view'] },
        { id: 'role-tech', name: 'Técnico', level: 40, permissions: ['services', 'inventory.view', 'inventory.use'] },
        { id: 'role-stock', name: 'Estoquista', level: 30, permissions: ['inventory', 'products.view', 'suppliers'] },
        { id: 'role-financial', name: 'Financeiro', level: 50, permissions: ['financial', 'reports', 'orders.view', 'payments'] }
    ];
    for (const r of roles) await db.put('roles', r);

    // Categories
    const categories = [
        { id: 'cat-01', name: 'Capas e Cases', icon: '🛡️', slug: 'capas-cases', order: 1, active: true, featured: true, image: '' },
        { id: 'cat-02', name: 'Películas', icon: '📱', slug: 'peliculas', order: 2, active: true, featured: true, image: '' },
        { id: 'cat-03', name: 'Carregadores', icon: '🔌', slug: 'carregadores', order: 3, active: true, featured: true, image: '' },
        { id: 'cat-04', name: 'Fones de Ouvido', icon: '🎧', slug: 'fones-ouvido', order: 4, active: true, featured: true, image: '' },
        { id: 'cat-05', name: 'Cabos', icon: '🔗', slug: 'cabos', order: 5, active: true, featured: false, image: '' },
        { id: 'cat-06', name: 'Suportes', icon: '📲', slug: 'suportes', order: 6, active: true, featured: false, image: '' },
        { id: 'cat-07', name: 'Baterias', icon: '🔋', slug: 'baterias', order: 7, active: true, featured: false, image: '' },
        { id: 'cat-08', name: 'Telas e Displays', icon: '🖥️', slug: 'telas-displays', order: 8, active: true, featured: false, image: '' },
        { id: 'cat-09', name: 'Caixas de Som', icon: '🔊', slug: 'caixas-som', order: 9, active: true, featured: true, image: '' },
        { id: 'cat-10', name: 'Smartwatches', icon: '⌚', slug: 'smartwatches', order: 10, active: true, featured: true, image: '' }
    ];
    for (const c of categories) await db.put('categories', c);

    // Products
    const products = [
        {
            id: 'prod-001', name: 'Capa Anti-Impacto iPhone 15', slug: 'capa-anti-impacto-iphone-15',
            description: 'Capa anti-impacto premium com proteção militar para iPhone 15. Material TPU flexível com bordas elevadas para proteger câmera e tela. Design translúcido que preserva a cor original do aparelho.',
            category_id: 'cat-01', brand: 'HitCell', model: 'iPhone 15',
            compatibility: ['iPhone 15'], colors: ['Transparente', 'Preto', 'Azul'],
            price: 79.90, cost: 25.00, promo_price: 59.90,
            stock: 45, min_stock: 10, weight: 50, active: true, featured: true,
            warranty: '3 meses', barcode: '7891234560001', internal_code: 'HC-CP-001',
            images: [], sales_count: 128, views: 450,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-002', name: 'Película Vidro 3D Samsung Galaxy S24', slug: 'pelicula-vidro-3d-samsung-s24',
            description: 'Película de vidro temperado 3D com cobertura total para Samsung Galaxy S24. Dureza 9H, anti-riscos, oleofóbica e com bordas curvadas para perfeita aderência.',
            category_id: 'cat-02', brand: 'HitCell', model: 'Samsung Galaxy S24',
            compatibility: ['Samsung Galaxy S24', 'Samsung Galaxy S24 5G'], colors: ['Transparente'],
            price: 49.90, cost: 12.00, promo_price: 39.90,
            stock: 80, min_stock: 20, weight: 20, active: true, featured: true,
            warranty: '30 dias', barcode: '7891234560002', internal_code: 'HC-PL-001',
            images: [], sales_count: 256, views: 890,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-003', name: 'Carregador Turbo USB-C 33W', slug: 'carregador-turbo-usb-c-33w',
            description: 'Carregador turbo com saída USB-C de 33W. Compatível com carregamento rápido para a maioria dos smartphones. Proteção contra sobrecarga, curto-circuito e superaquecimento.',
            category_id: 'cat-03', brand: 'Baseus', model: 'Universal',
            compatibility: ['iPhone', 'Samsung', 'Motorola', 'Xiaomi'], colors: ['Branco', 'Preto'],
            price: 89.90, cost: 35.00, promo_price: null,
            stock: 30, min_stock: 8, weight: 80, active: true, featured: true,
            warranty: '6 meses', barcode: '7891234560003', internal_code: 'HC-CR-001',
            images: [], sales_count: 89, views: 320,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-004', name: 'Fone Bluetooth TWS Pro', slug: 'fone-bluetooth-tws-pro',
            description: 'Fone de ouvido sem fio TWS com cancelamento de ruído ativo. Bateria de até 30 horas com o estojo. Resistente à água IPX5. Som Hi-Fi com driver de 13mm.',
            category_id: 'cat-04', brand: 'HitCell', model: 'TWS Pro',
            compatibility: ['Universal'], colors: ['Preto', 'Branco'],
            price: 149.90, cost: 45.00, promo_price: 119.90,
            stock: 25, min_stock: 5, weight: 45, active: true, featured: true,
            warranty: '6 meses', barcode: '7891234560004', internal_code: 'HC-FN-001',
            images: [], sales_count: 67, views: 540,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-005', name: 'Cabo USB-C para Lightning 2m', slug: 'cabo-usb-c-lightning-2m',
            description: 'Cabo de dados e carregamento USB-C para Lightning com 2 metros. Revestimento em nylon trançado para maior durabilidade. Suporta carregamento rápido.',
            category_id: 'cat-05', brand: 'Baseus', model: 'Universal',
            compatibility: ['iPhone 8+', 'iPad'], colors: ['Preto', 'Cinza'],
            price: 59.90, cost: 18.00, promo_price: 44.90,
            stock: 60, min_stock: 15, weight: 35, active: true, featured: false,
            warranty: '3 meses', barcode: '7891234560005', internal_code: 'HC-CB-001',
            images: [], sales_count: 145, views: 380,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-006', name: 'Suporte Veicular Magnético', slug: 'suporte-veicular-magnetico',
            description: 'Suporte veicular magnético com fixação na saída de ar. Imã de neodímio forte e seguro. Rotação 360° para melhor ângulo de visualização.',
            category_id: 'cat-06', brand: 'HitCell', model: 'Universal',
            compatibility: ['Universal'], colors: ['Preto'],
            price: 39.90, cost: 10.00, promo_price: null,
            stock: 40, min_stock: 10, weight: 60, active: true, featured: false,
            warranty: '3 meses', barcode: '7891234560006', internal_code: 'HC-SP-001',
            images: [], sales_count: 34, views: 180,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-007', name: 'Caixa de Som Bluetooth Portátil 20W', slug: 'caixa-som-bluetooth-20w',
            description: 'Caixa de som portátil com 20W de potência. Resistente à água IPX6. Bateria de 12 horas. Conexão Bluetooth 5.3 com alcance de 15m.',
            category_id: 'cat-09', brand: 'JBL', model: 'Go 3',
            compatibility: ['Universal'], colors: ['Preto', 'Vermelho', 'Azul'],
            price: 249.90, cost: 120.00, promo_price: 199.90,
            stock: 12, min_stock: 3, weight: 350, active: true, featured: true,
            warranty: '12 meses', barcode: '7891234560007', internal_code: 'HC-CX-001',
            images: [], sales_count: 23, views: 670,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-008', name: 'Smartwatch Fitness Pro', slug: 'smartwatch-fitness-pro',
            description: 'Smartwatch com tela AMOLED de 1.85". Monitor cardíaco, oxímetro, mais de 100 modos esportivos. Bateria de até 7 dias. Resistente à água IP68.',
            category_id: 'cat-10', brand: 'HitCell', model: 'Fit Pro',
            compatibility: ['Android', 'iOS'], colors: ['Preto', 'Rosa', 'Verde'],
            price: 199.90, cost: 65.00, promo_price: 169.90,
            stock: 18, min_stock: 5, weight: 45, active: true, featured: true,
            warranty: '6 meses', barcode: '7891234560008', internal_code: 'HC-SW-001',
            images: [], sales_count: 45, views: 920,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-009', name: 'Película Privacidade iPhone 15 Pro Max', slug: 'pelicula-privacidade-iphone15pm',
            description: 'Película de vidro temperado com filtro de privacidade para iPhone 15 Pro Max. Protege sua tela contra olhares indiscretos laterais. Dureza 9H.',
            category_id: 'cat-02', brand: 'HitCell', model: 'iPhone 15 Pro Max',
            compatibility: ['iPhone 15 Pro Max'], colors: ['Privacidade'],
            price: 69.90, cost: 18.00, promo_price: 54.90,
            stock: 35, min_stock: 10, weight: 25, active: true, featured: false,
            warranty: '30 dias', barcode: '7891234560009', internal_code: 'HC-PL-002',
            images: [], sales_count: 78, views: 410,
            delivery_available: true, pickup_available: true
        },
        {
            id: 'prod-010', name: 'Carregador Wireless 15W', slug: 'carregador-wireless-15w',
            description: 'Carregador sem fio de 15W com base antideslizante. Compatível com Qi. LED indicador de carregamento. Design slim e elegante.',
            category_id: 'cat-03', brand: 'Baseus', model: 'Universal',
            compatibility: ['iPhone 12+', 'Samsung S20+', 'Qi Compatible'], colors: ['Preto', 'Branco'],
            price: 119.90, cost: 40.00, promo_price: 99.90,
            stock: 20, min_stock: 5, weight: 100, active: true, featured: true,
            warranty: '6 meses', barcode: '7891234560010', internal_code: 'HC-CR-002',
            images: [], sales_count: 56, views: 380,
            delivery_available: true, pickup_available: true
        }
    ];
    for (const p of products) await db.put('products', p);

    // Banners
    const banners = [
        {
            id: 'banner-01', title: 'Assistência Técnica Especializada',
            subtitle: 'Seu celular em boas mãos. Diagnóstico gratuito!',
            cta_text: 'Solicitar Atendimento', cta_link: '/assistencia',
            bg_color: '#1a1a1a', text_color: '#ffffff',
            order: 1, active: true, type: 'hero'
        },
        {
            id: 'banner-02', title: 'Acessórios com até 30% OFF',
            subtitle: 'Capas, películas, carregadores e muito mais',
            cta_text: 'Ver Ofertas', cta_link: '/loja?promo=true',
            bg_color: '#dc2626', text_color: '#ffffff',
            order: 2, active: true, type: 'hero'
        },
        {
            id: 'banner-03', title: 'Frete Grátis na Aroeira',
            subtitle: 'Compre pelo site e receba em casa',
            cta_text: 'Comprar Agora', cta_link: '/loja',
            bg_color: '#000000', text_color: '#ffffff',
            order: 3, active: true, type: 'hero'
        }
    ];
    for (const b of banners) await db.put('banners', b);

    // Testimonials
    const testimonials = [
        { id: 'test-01', name: 'Maria Silva', text: 'Excelente atendimento! Trocaram a tela do meu iPhone em menos de 1 hora. Recomendo demais!', rating: 5, active: true, approved: true },
        { id: 'test-02', name: 'João Santos', text: 'Comprei uma capa e película, preço justo e qualidade top. Equipe muito atenciosa.', rating: 5, active: true, approved: true },
        { id: 'test-03', name: 'Ana Oliveira', text: 'Meu Samsung estava com problema na placa e eles resolveram rapidinho. Garantia de 90 dias me deu tranquilidade.', rating: 5, active: true, approved: true },
        { id: 'test-04', name: 'Carlos Mendes', text: 'Melhor assistência técnica de Macaé! Profissionais qualificados e preço honesto.', rating: 4, active: true, approved: true }
    ];
    for (const t of testimonials) await db.put('testimonials', t);

    // FAQ
    const faqs = [
        { id: 'faq-01', question: 'Qual o prazo para conserto do meu celular?', answer: 'O prazo varia de acordo com o serviço. Trocas de tela e bateria geralmente são realizadas no mesmo dia. Serviços mais complexos podem levar de 2 a 5 dias úteis.', order: 1, active: true },
        { id: 'faq-02', question: 'Vocês oferecem garantia nos serviços?', answer: 'Sim! Todos os nossos serviços de assistência técnica possuem garantia de 90 dias, incluindo peças e mão de obra.', order: 2, active: true },
        { id: 'faq-03', question: 'Posso comprar pelo site e retirar na loja?', answer: 'Sim! Oferecemos a opção de retirada gratuita em nossa loja na Rua Alcides Mourão, 350 – Aroeira, Macaé.', order: 3, active: true },
        { id: 'faq-04', question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos Pix, cartão de crédito (em até 12x), cartão de débito e dinheiro. No site, as formas de pagamento disponíveis são Pix e cartão.', order: 4, active: true },
        { id: 'faq-05', question: 'Vocês fazem entrega?', answer: 'Sim! Realizamos entregas em diversos bairros de Macaé. O valor e prazo variam de acordo com a região. Confira na finalização da compra.', order: 5, active: true },
        { id: 'faq-06', question: 'Como acompanho meu pedido ou serviço?', answer: 'Você pode acompanhar pelo menu "Acompanhar Pedido" ou "Acompanhar Serviço" no site, ou através da sua conta na área "Minha Conta".', order: 6, active: true }
    ];
    for (const f of faqs) await db.put('faq', f);

    // Services offered
    await db.put('site_content', {
        id: 'services',
        type: 'services',
        items: [
            { icon: '📱', title: 'Troca de Tela', description: 'Telas originais e compatíveis para todas as marcas' },
            { icon: '🔋', title: 'Troca de Bateria', description: 'Baterias de alta qualidade com garantia' },
            { icon: '🔌', title: 'Troca de Conector', description: 'Reparo de conector de carga USB-C e Lightning' },
            { icon: '💧', title: 'Reparo Líquido', description: 'Recuperação de aparelhos que tiveram contato com água' },
            { icon: '🔧', title: 'Reparo de Placa', description: 'Microsoldagem e reparo de componentes na placa' },
            { icon: '📸', title: 'Troca de Câmera', description: 'Substituição de câmeras frontal e traseira' },
            { icon: '🔊', title: 'Alto-falante e Microfone', description: 'Troca de alto-falantes e microfones' },
            { icon: '⚙️', title: 'Software', description: 'Atualização, formatação e remoção de vírus' }
        ]
    });

    // Differentials
    await db.put('site_content', {
        id: 'differentials',
        type: 'differentials',
        items: [
            { icon: '✅', title: 'Garantia Real', description: '90 dias em todos os serviços' },
            { icon: '⚡', title: 'Atendimento Rápido', description: 'Muitos serviços no mesmo dia' },
            { icon: '🏆', title: 'Técnicos Qualificados', description: 'Equipe especializada e certificada' },
            { icon: '💰', title: 'Preço Justo', description: 'Orçamento gratuito e sem surpresas' },
            { icon: '📦', title: 'Peças de Qualidade', description: 'Componentes originais e compatíveis' },
            { icon: '🛡️', title: 'Segurança', description: 'Seus dados protegidos e sigilo total' }
        ]
    });

    // Pages
    const pages = [
        { id: 'page-about', slug: 'sobre', title: 'Sobre a HitCell Macaé', content: 'A HitCell Macaé é referência em assistência técnica e acessórios para celulares na região. Com uma equipe de técnicos qualificados e comprometidos com a excelência, oferecemos soluções completas para seu smartphone.\n\nNossa missão é proporcionar o melhor atendimento, com rapidez, qualidade e preço justo. Trabalhamos com peças de alta qualidade e oferecemos garantia em todos os nossos serviços.\n\nLocalizada na Rua Alcides Mourão, 350 – Aroeira, Macaé – RJ, estamos prontos para atendê-lo.', active: true },
        { id: 'page-warranty', slug: 'garantia', title: 'Política de Garantia', content: 'Todos os serviços de assistência técnica realizados pela HitCell Macaé possuem garantia de 90 dias, cobrindo peças e mão de obra.\n\nA garantia não cobre:\n- Danos causados por mau uso, quedas ou contato com líquidos após o reparo\n- Tentativas de reparo por terceiros\n- Danos causados por uso de acessórios não compatíveis\n\nPara acionar a garantia, entre em contato conosco pelo WhatsApp ou compareça à loja com o comprovante do serviço.', active: true },
        { id: 'page-return', slug: 'trocas', title: 'Política de Troca', content: 'Aceitamos trocas de produtos em até 7 dias após a compra, desde que:\n- O produto esteja em perfeitas condições\n- Acompanhado da nota fiscal\n- Na embalagem original\n\nProdutos com defeito de fabricação podem ser trocados em até 30 dias.\n\nPara solicitar uma troca, entre em contato pelo WhatsApp (22) 99973-7366.', active: true },
        { id: 'page-privacy', slug: 'privacidade', title: 'Política de Privacidade', content: 'A HitCell Macaé está comprometida com a proteção dos dados pessoais de seus clientes, em conformidade com a Lei Geral de Proteção de Dados (LGPD).\n\nColetamos apenas os dados necessários para prestação de nossos serviços, realização de vendas e comunicação com o cliente.\n\nSeus dados não serão compartilhados com terceiros sem seu consentimento expresso, exceto quando exigido por lei.\n\nVocê pode solicitar a atualização ou exclusão de seus dados a qualquer momento.', active: true },
        { id: 'page-service-terms', slug: 'termos-atendimento', title: 'Termos de Atendimento', content: 'Ao solicitar um serviço de assistência técnica na HitCell Macaé, o cliente:\n\n1. Autoriza a abertura e diagnóstico do aparelho\n2. Será informado sobre o orçamento antes da execução do serviço\n3. Deverá aprovar ou recusar o orçamento\n4. Concorda que aparelhos não retirados em até 90 dias após a conclusão poderão ser descartados\n5. Reconhece que o diagnóstico inicial pode ser alterado durante o processo de reparo', active: true },
        { id: 'page-purchase-terms', slug: 'termos-compra', title: 'Termos de Compra', content: 'Ao realizar uma compra na HitCell Macaé:\n\n1. O cliente declara ter lido e concordado com os termos\n2. Os preços são válidos na data da compra\n3. A disponibilidade está sujeita ao estoque\n4. O prazo de entrega começa a contar após a confirmação do pagamento\n5. O cliente pode optar por retirada gratuita na loja ou entrega em domicílio', active: true }
    ];
    for (const p of pages) await db.put('pages', p);

    // Coupons
    const coupons = [
        { id: 'coupon-01', code: 'BEMVINDO10', discount_type: 'percentage', discount_value: 10, min_purchase: 50, max_uses: 100, used: 0, active: true, expires_at: '2027-12-31' },
        { id: 'coupon-02', code: 'HITCELL20', discount_type: 'percentage', discount_value: 20, min_purchase: 100, max_uses: 50, used: 0, active: true, expires_at: '2027-06-30' },
        { id: 'coupon-03', code: 'FRETEGRATIS', discount_type: 'free_shipping', discount_value: 0, min_purchase: 80, max_uses: 200, used: 0, active: true, expires_at: '2027-12-31' }
    ];
    for (const c of coupons) await db.put('coupons', c);

    // Payment integrations
    await db.put('payment_integrations', {
        id: 'mercadopago',
        name: 'Mercado Pago',
        provider: 'mercadopago',
        active: false,
        sandbox: true,
        public_key: '',
        access_token: '',
        pix_enabled: true,
        credit_card_enabled: true,
        debit_card_enabled: false,
        max_installments: 12,
        installment_fee: 0,
        status: 'disconnected'
    });

    await db.put('payment_integrations', {
        id: 'infinitepay',
        name: 'InfinitePay',
        provider: 'infinitepay',
        active: false,
        sandbox: true,
        api_key: '',
        client_id: '',
        client_secret: '',
        pix_enabled: true,
        credit_card_enabled: true,
        debit_card_enabled: true,
        max_installments: 12,
        installment_fee: 0,
        status: 'disconnected'
    });

    // Cash register
    await db.put('cash_registers', {
        id: 'cash-001',
        opened_at: new Date().toISOString(),
        opened_by: 'admin-001',
        opening_balance: 200.00,
        current_balance: 200.00,
        status: 'open'
    });

    // Suppliers
    const suppliers = [
        { id: 'sup-01', name: 'Distribuidora TechParts', contact: 'Paulo', phone: '(21) 99999-0001', email: 'vendas@techparts.com', address: 'Rio de Janeiro - RJ', active: true },
        { id: 'sup-02', name: 'Import Cell Acessórios', contact: 'Fernando', phone: '(11) 99999-0002', email: 'comercial@importcell.com', address: 'São Paulo - SP', active: true }
    ];
    for (const s of suppliers) await db.put('suppliers', s);

    localStorage.setItem(SEED_KEY, 'true');
    console.log('✅ HitCell DB seeded successfully');
}
