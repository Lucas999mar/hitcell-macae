import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import db from '../../database/db';

export default function PageView({ slug: propSlug }) {
    const params = useParams();
    const slug = propSlug || params.slug;
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        db.query('pages', p => p.slug === slug && p.active).then(pages => {
            setPage(pages[0] || null);
            setLoading(false);
        });
    }, [slug]);

    if (loading) return <div className="page-loader"><div className="loader"></div></div>;

    // Hardcoded Fallbacks for professional pages to ensure they are never blank
    const fallbackPages = {
        'garantia': {
            title: 'Política de Garantia',
            content: `A HitCell Macaé assegura garantia para os serviços prestados e produtos vendidos, conforme determina o Código de Defesa do Consumidor (CDC).\n\n1. PRAZOS DE GARANTIA\n- Produtos e Acessórios: Garantia legal de 90 (noventa) dias contra defeitos de fabricação.\n- Serviços de Manutenção: Garantia de 90 (noventa) dias sobre o serviço realizado e as peças substituídas.\n\n2. CONDIÇÕES DE PERDA DE GARANTIA\nA garantia será automaticamente cancelada caso seja constatado:\n- Mau uso, quedas, esmagamentos ou sinais de impacto físico;\n- Exposição do aparelho/produto a líquidos, umidade extrema ou calor excessivo (salvo se o aparelho tiver certificação e o conserto houver garantido a vedação, especificado em OS);\n- Abertura do equipamento por terceiros não autorizados pela HitCell;\n- Rompimento do lacre de segurança interno da assistência.\n\n3. ACIONAMENTO\nPara acionar a garantia, é indispensável a apresentação da Ordem de Serviço (OS) ou do Recibo de Compra original.\n\nA HitCell Macaé compromete-se a avaliar e solucionar o problema no menor tempo hábil possível, priorizando sempre a transparência com o cliente.`
        },
        'trocas': {
            title: 'Política de Troca e Devoluções',
            content: `Nosso objetivo é garantir a total satisfação dos nossos clientes, respeitando criteriosamente as normativas do Código de Defesa do Consumidor.\n\n1. DEVOLUÇÃO POR ARREPENDIMENTO\nPara compras realizadas online ou fora do estabelecimento comercial, o cliente tem até 7 (sete) dias corridos, contados a partir do recebimento do produto, para exercer o direito de arrependimento. O produto deve ser devolvido na embalagem original, sem sinais de uso, acompanhado de todos os acessórios.\n\n2. TROCA POR DEFEITO\nCaso o produto adquirido apresente defeito de fabricação dentro do prazo de garantia de 90 dias, a HitCell Macaé fará a análise técnica. Confirmado o defeito, realizaremos a troca por um produto idêntico ou similar, ou o reparo do bem. Produtos avariados por mau uso não são elegíveis para troca.\n\n3. COMO SOLICITAR\nEntre em contato conosco através do WhatsApp da loja ou dirija-se presencialmente ao nosso balcão na Rua Alcides Mourão, 350. Lembre-se de levar a via do consumidor ou recibo de pagamento.\n\nAtenção: Películas de vidro/hidrogel instaladas na loja não possuem troca caso sejam danificadas ou levantadas após o cliente deixar o estabelecimento, sendo o desgaste de responsabilidade do uso.`
        },
        'privacidade': {
            title: 'Política de Privacidade',
            content: `A HitCell Macaé valoriza a privacidade dos seus dados e está comprometida com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).\n\n1. COLETA DE DADOS\nColetamos apenas os dados estritamente necessários para a execução dos nossos serviços, como: nome completo, telefone (WhatsApp), e-mail e endereço. No caso de aparelhos deixados para reparo, podemos solicitar a senha de desbloqueio exclusivamente para fins de testes técnicos.\n\n2. SIGILO DOS APARELHOS\nGarantimos total sigilo e inviolabilidade das fotos, conversas, arquivos e dados bancários contidos nos aparelhos dos nossos clientes.\n\n3. USO DOS DADOS\nSeus dados de contato são utilizados apenas para o andamento do seu pedido (avisos mecânicos de OS) e para contatos administrativos. Não vendemos ou cedemos listas de clientes para terceiros.\n\n4. DIREITOS DO TITULAR\nVocê tem o direito de solicitar a exclusão da sua conta e dos seus dados do nosso sistema através da aba "Minha Conta" ou entrando em contato com nosso time de atendimento.`
        },
        'termos-atendimento': {
            title: 'Termos de Atendimento (Assistência Técnica)',
            content: `Ao dar entrada com o seu equipamento na HitCell Macaé, o cliente declara estar ciente e de acordo com as seguintes normas laborais:\n\n1. ORÇAMENTO PRÉVIO E DIAGNÓSTICO\nA taxa de avaliação é gratuita na maioria dos casos. Caso o diagnóstico exija complexidade de bancada extrema (microsoldagens longas), o cliente será previamente avisado.\n\n2. PRAZOS DE CONCLUSÃO\nO prazo estimado varia de acordo com a complexidade do defeito e disponibilidade da peça, normalmente compreendido entre 1 e 5 dias úteis.\n\n3. DEVER DE RETIRADA (ABANDONO DE APARELHO)\nAparelhos deixados na assistência e aprovados, rejeitados ou sem aprovação de orçamento que não forem retirados dentro de 90 (noventa) dias corridos serão considerados ABANDONADOS. A HitCell Macaé reserva-se ao direito de descartá-los ou repassá-los para cobrir custas operacionais, sem direito a ressarcimento legal posterior (Art. 1275, III do Código Civil).\n\n4. INTEGRIDADE DA PLACA\nAparelhos que entram desligados ou não dão imagem (apagados), serão avaliados com ressalvas. A loja não se responsabiliza por vícios ocultos na placa-mãe (ex: defeitos no processador/memória) que impossibilitem o retorno do aparelho ao estado funcional original.`
        },
        'termos-compra': {
            title: 'Termos de Compra e E-commerce',
            content: `1. PREÇOS E DISPONIBILIDADE\nOs preços e estoques exibidos no site podem sofrer oscilações. Compras virtuais dependem da efetiva separação em loja e aprovação do pagamento.\n\n2. FORMAS DE PAGAMENTO\nAceitamos Pix, cartões de crédito e débito. Compras parceladas estão sujeitas a juros e taxas, que sempre serão transparentemente listadas no Checkout.\n\n3. RETIRADA EM LOJA\nPedidos marcados para "Retirada em Loja" ficarão reservados por um prazo estipulado e devem ser retirados pelo titular da compra ou por pessoa previamente autorizada portando documento de identificação.\n\n4. COMUNICAÇÃO\nAs atualizações de status de compra e envio serão disparadas pelo nosso WhatsApp comercial ou exibidas diretamente na "Minha Conta" do sistema.`
        },
        'sobre': {
            title: 'Sobre a HitCell Macaé',
            content: `A HitCell Macaé nasceu da paixão por tecnologia e da vontade de oferecer um serviço de manutenção transparente, rápido e extremamente confiável para toda a região.\n\nNossa missão é solucionar problemas do seu dia a dia através do reparo de excelência, além de ofertar os melhores acessórios do mercado com preço justo e atendimento ímpar.\n\nLocalizados na Rua Alcides Mourão, nosso laboratório conta com ferramentas modernas e capacitação técnica constante, assegurando que seu equipamento esteja sempre em boas mãos.\n\nQueremos ser mais do que a sua assistência técnica, queremos ser as Suas Soluções em Tecnologia.`
        }
    };

    const displayPage = page || fallbackPages[slug];

    if (!displayPage) return <div className="container section"><div className="empty-state"><div className="empty-state-icon">📄</div><p className="empty-state-title">Página não encontrada</p></div></div>;

    return (
        <div className="container" style={{ maxWidth: 800, padding: '40px 20px 60px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 32 }}>{displayPage.title}</h1>
            <div style={{ color: 'var(--gray-300)', lineHeight: '2.2', whiteSpace: 'pre-line', fontSize: '1.05rem', letterSpacing: '0.01em' }}>{displayPage.content}</div>
        </div>
    );
}
