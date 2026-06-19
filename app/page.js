import Link from 'next/link';

const stories = [
  {
    code: 'US-001',
    title: 'Comprar Produtos',
    label: 'Usuário',
    points: '8 pts',
    priority: 'Alta',
    description:
      'Busca por nome ou categoria, carrinho, finalização e registro do pedido com nota fiscal.',
  },
  {
    code: 'US-002',
    title: 'Agendar Serviços',
    label: 'Usuário',
    points: '5 pts',
    priority: 'Alta',
    description:
      'Seleção de data e hora, visualização dos horários disponíveis e confirmação do agendamento.',
  },
  {
    code: 'US-003',
    title: 'Cadastrar Produtos',
    label: 'Funcionário',
    points: '3 pts',
    priority: 'Alta',
    description:
      'Cadastro com nome, preço e descrição, além de edição e remoção de produtos já registrados.',
  },
];

const quickFacts = [
  { label: 'Título do projeto', value: 'Agiliza' },
  { label: 'Objetivo', value: 'Unificar serviços e vendas' },
  { label: 'Base técnica', value: 'Next.js + Prisma + PostgreSQL' },
  { label: 'Público', value: 'Devs que vão continuar o produto' },
];

const stack = [
  'App Router',
  'ESLint',
  'Prisma',
  'PostgreSQL',
  'React 19',
  'Next.js 16',
];

const nextSteps = [
  'Mapear o modelo de dados em Prisma para produtos, serviços, pedidos e agendamentos.',
  'Substituir os cards estáticos por consultas reais no banco quando as rotas estiverem prontas.',
  'Criar telas específicas para compra, agendamento e cadastro conforme as histórias de usuário.',
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Agiliza-web</p>
          <h1>Base visual pronta para quem vai continuar o projeto.</h1>
        </div>

        <div className="topbar-badge">
          <span className="status-dot" />
          <div>
            <strong>Next.js rodando</strong>
            <p>Scaffold atual com App Router, ícone e ESLint validado.</p>
          </div>
        </div>
      </section>

      <section className="panel-grid">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Acesso rápido</p>
            <h2>Testar funcionalidades do MVP</h2>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <Link
            className="button primary"
            href="/funcionario/produtos"
          >
            Funcionário - Produtos
          </Link>

          <Link
            className="button secondary"
            href="/funcionario/servicos"
          >
            Funcionário - Serviços
          </Link>

          <Link
            className="button primary"
            href="/cliente/produtos"
          >
            Cliente - Produtos
          </Link>

          <Link
            className="button secondary"
            href="/cliente/carrinho"
          >
            Cliente - Carrinho
          </Link>

          <Link
            className="button primary"
            href="/cliente/pedidos"
          >
            Cliente - Pedidos
          </Link>

          <Link
            className="button secondary"
            href="/cliente/servicos"
          >
            Cliente - Serviços
          </Link>

          <Link
            className="button primary"
            href="/cliente/agendamentos"
          >
            Cliente - Agendamentos
          </Link>
        </div>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <p className="lede">
            Esta tela resume o que está no <strong>README</strong> e nas histórias de
            usuário do <strong>docs/historias_usuario.md</strong>, para facilitar a
            entrada de novos devs sem depender de caça ao contexto.
          </p>

          <div className="hero-actions">
            <Link className="button primary" href="#stories">
              Ver histórias
            </Link>
            <Link className="button secondary" href="#next-steps">
              Próximos passos
            </Link>
          </div>

          <div className="quick-facts" id="readme">
            {quickFacts.map((item) => (
              <article className="fact-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>

        <aside className="terminal-card">
          <div className="terminal-header">
            <span />
            <span />
            <span />
          </div>

          <p className="terminal-label">Comandos úteis</p>

          <pre>{`npm run dev
npm run build
npm run lint`}</pre>

          <p className="terminal-note">
            Base pronta para evoluir com Prisma e as próximas rotas.
          </p>
        </aside>
      </section>

      <section className="panel-grid" id="stories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Histórias principais</p>
            <h2>O que a aplicação precisa cobrir primeiro</h2>
          </div>
        </div>

        <div className="story-grid">
          {stories.map((story) => (
            <article className="story-card" key={story.code}>
              <div className="story-card__top">
                <span className="story-code">{story.code}</span>
                <span className="story-priority">{story.priority}</span>
              </div>

              <h3>{story.title}</h3>

              <p>{story.description}</p>

              <div className="story-meta">
                <span>{story.label}</span>
                <span>{story.points}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-grid panel-grid--split" id="next-steps">
        <article className="info-card">
          <p className="eyebrow">Stack e estrutura</p>

          <h2>Componentes que já estão prontos</h2>

          <div className="chip-list">
            {stack.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="info-card info-card--accent">
          <p className="eyebrow">Próximos passos</p>

          <h2>Roteiro sugerido para a continuidade</h2>

          <ol className="steps-list">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}