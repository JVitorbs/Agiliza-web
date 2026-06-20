import Link from "next/link"
import { Store, Calendar, Package, Building2, ShoppingBag, Shield, Truck, CreditCard } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.08] to-transparent" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Marketplace de produtos e serviços
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
            Descubra produtos e serviços
            <br />
            <span className="text-primary">perto de você.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Compre de empresas locais, agende serviços e acompanhe tudo em um só lugar.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/cliente/produtos"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver produtos
            </Link>
            <Link
              href="/cliente/servicos"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-8 text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Agendar serviços
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
          {[
            { icon: Store, label: "Lojas verificadas" },
            { icon: Shield, label: "Compra segura" },
            { icon: Truck, label: "Entrega garantida" },
            { icon: CreditCard, label: "Pagamento fácil" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 bg-card py-8 px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Como funciona</p>
          <h2 className="text-3xl font-bold tracking-tight">Em três passos</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { step: "01", title: "Explore", desc: "Navegue por produtos e serviços das empresas cadastradas." },
            { step: "02", title: "Escolha", desc: "Adicione ao carrinho ou agende o horário ideal para você." },
            { step: "03", title: "Receba", desc: "Acompanhe seus pedidos e agendamentos em tempo real." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories / Features */}
      <section className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">O que oferecemos</p>
          <h2 className="text-3xl font-bold tracking-tight">Tudo que você precisa</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Store,
              title: "Produtos variados",
              desc: "De alimentos a eletrônicos, encontre o que precisa com empresas da sua região.",
              href: "/cliente/produtos",
            },
            {
              icon: Calendar,
              title: "Agendamento online",
              desc: "Marque serviços no dia e horário que preferir, sem filas ou telefonemas.",
              href: "/cliente/servicos",
            },
            {
              icon: Package,
              title: "Acompanhamento total",
              desc: "Histórico completo de compras e agendamentos sempre à mão.",
              href: "/cliente/pedidos",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.title} href={item.href} className="group">
                <article className="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-1.5 transition-all">
                    Saiba mais <span aria-hidden>→</span>
                  </span>
                </article>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Empresa CTA */}
      <section className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.12] to-primary/[0.03] p-10 sm:p-14">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
                  <Building2 className="h-3 w-3" />
                  Para empresas
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                  Sua empresa na Agiliza
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cadastre sua empresa, publique produtos e serviços, e alcance novos clientes.
                  Tudo com uma plataforma simples e moderna.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Cadastrar empresa
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
