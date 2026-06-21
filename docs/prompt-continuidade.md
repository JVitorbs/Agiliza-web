# Prompt de Continuidade — Agiliza-web

## Contexto Acadêmico

Projeto para disciplina de **Engenharia de Software** (apresentação com nota). O que será cobrado:

1. **Pitch:** introdução do problema com análise de dados (trabalho de BD integrado), apresentação do MVP
2. **Parte técnica:**
   - Estrutura e organização do repositório Git
   - Três User Stories (US-001, US-002, US-003)
   - Princípios de Projeto com justificativa
   - Autenticação e autorização implementadas
   - Testes unitários com **mínimo 60% de cobertura**
   - Integração Contínua (CI) com testes automatizados via GitHub Actions
3. **Demonstração:** MVP funcionando ao vivo, contribuição de cada membro
4. **Extra (vale ponto):** diagramas estruturais/comportamentais, padrões de projeto com justificativa

**Apresentação:** 30 a 40 minutos. Avaliação inclui qualidade dos slides, domínio do tema e README.md bem documentado no GitHub.

**Membros:** Hugo Henrique, João Vitor Batista Silva, Luciano de Medeiros Filho

---

## Sobre o Sistema

**Nome:** Agiliza  
**Descrição:** Plataforma web de unificação de serviços e vendas  
**Repo:** https://github.com/JVitorbs/Agiliza-web

### User Stories

| ID | Título | Ator | Critérios principais |
|---|---|---|---|
| US-001 | Comprar Produtos | Usuário/Cliente | Buscar por nome, adicionar ao carrinho, finalizar compra, registrar pedido com nota fiscal |
| US-002 | Agendar Serviços | Usuário/Cliente | Ver horários disponíveis, selecionar data e hora, confirmar agendamento, aparecer no histórico |
| US-003 | Cadastrar Produtos | Funcionário | Informar nome/preço/descrição, produto fica visível para clientes, editar e remover |

---

## Stack Completa

- **Next.js 16.2.6** com App Router e Turbopack — NÃO usar Pages Router
- **React 19**
- **Tailwind CSS v4** — sintaxe `@import "tailwindcss"` no CSS, tema via `@theme {}`, postcss com `@tailwindcss/postcss`
- **shadcn/ui** — componentes criados manualmente (CLI do shadcn funciona com Next.js 16 via `npx shadcn@latest add`; `components.json` configurado com `style: default`, `tailwind.css: app/globals.css`, `aliases: @/app/components`)
- **Prisma 7** com `@prisma/adapter-pg` + `pg` — client gerado em `generated/prisma/` (não em `node_modules`)
- **PostgreSQL no Supabase** — já configurado e rodando, `.env` já tem todas as variáveis
- **JWT** via `jsonwebtoken` + cookie httpOnly `agiliza_token` — autorização em `proxy.js`
- **bcryptjs** para hash de senha
- **jose** para verificação de JWT no Edge Runtime (proxy.js)
- **Vitest** para testes (não Jest) — modo in-memory para testes, Prisma para produção
- **Sonner** (`next-sonner`) — notificações toast, `<Toaster />` no layout raiz, substituiu o hook `useAlert`
- **Recharts** — biblioteca de gráficos usada no dashboard da empresa com componente Chart (shadcn/ui)
- **GitHub Actions** CI em `.github/workflows/ci.yml` — job de build + job de testes separados
- Deploy na **Vercel**, banco no **Supabase** (região sa-east-1)
- **Sem imagens** — sem storage, sem Supabase Storage, sem S3. Cards usam ícones/emojis/gradientes por categoria

---

## Variáveis de Ambiente (`.env`)

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres.lynfirxqualatokgxkxp:...@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:...@db.lynfirxqualatokgxkxp.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://lynfirxqualatokgxkxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET não está no .env ainda — usar "agiliza-secret-dev" como fallback no código
```

Na Vercel, todas as variáveis acima precisam ser configuradas no painel + `JWT_SECRET` com valor seguro.

---

## Estrutura de Arquivos Atual

```
Agiliza-web/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js       ✅ PRONTO (busca Funcionario→Usuario→Empresa)
│   │   │   ├── logout/route.js      ✅ PRONTO
│   │   │   ├── register/route.js    ✅ PRONTO (email único nas 3 tabelas, campo empresaEmail opcional)
│   │   │   └── me/route.js          ✅ PRONTO (inclui endereco e empresa na query)
│   │   ├── empresa/
│   │   │   ├── dashboard/route.js   ✅ PRONTO — GET com $transaction (7 queries) + agregações
│   │   │   └── funcionarios/route.js ✅ PRONTO — GET lista, POST vincula, DELETE desvincula
│   │   ├── products/route.js        ✅ PRONTO (GET público, mutações requer funcionário/empresa)
│   │   ├── services/route.js        ✅ PRONTO (GET público, mutações requer funcionário/empresa)
│   │   ├── cart/route.js            ✅ PRONTO (Prisma em prod, in-memory em teste)
│   │   ├── orders/route.js          ✅ PRONTO (Prisma em prod, in-memory em teste)
│   │   └── appointments/route.js    ✅ PRONTO (Prisma em prod, in-memory em teste)
│   ├── components/
│   │   ├── Navbar.jsx               ✅ PRONTO (links por role, popover, mobile, Sonner)
│   │   └── ui/
│   │       ├── button.jsx           ✅ PRONTO — shadcn Button
│   │       ├── card.jsx             ✅ PRONTO — shadcn Card (rounded-lg, p-6)
│   │       ├── badge.jsx            ✅ PRONTO — shadcn Badge
│   │       ├── input.jsx            ✅ PRONTO — shadcn Input
│   │       ├── dialog.jsx           ✅ PRONTO — shadcn Dialog
│   │       ├── label.jsx            ✅ PRONTO — shadcn Label
│   │       ├── separator.jsx        ✅ PRONTO — shadcn Separator
│   │       └── chart.jsx            ✅ PRONTO — shadcn Chart (ChartContainer, ChartTooltip, ChartLegend)
│   ├── lib/
│   │   ├── prisma.js                ✅ PRONTO — singleton com PrismaPg adapter
│   │   ├── validation.js            ✅ PRONTO — schemas Zod
│   │   ├── masks.js                 ✅ PRONTO — CPF/CNPJ masks
│   │   ├── error-handler.js         ✅ PRONTO — tratamento de erros
│   │   └── utils.js                 ✅ PRONTO — cn() helper (clsx + tailwind-merge)
│   ├── services/
│   │   ├── ProductService.js        ✅ PRONTO — validateProduct()
│   │   ├── CartService.js           ✅ PRONTO — addItem(), removeItem(), calculateTotal()
│   │   ├── AppointmentService.js    ✅ PRONTO — validateDate(), validateConflict(), validateAppointment()
│   │   └── ServiceService.js        ✅ PRONTO — validateService() com dias/horários
│   ├── data/store.js                ✅ PRONTO — arrays in-memory para testes
│   ├── empresa/
│   │   ├── dashboard/page.js        ✅ PRONTO — 4 cards métricos + 3 gráficos (bar agendamentos, pie serviços, bar vendas)
│   │   └── funcionarios/page.js     ✅ PRONTO — tabela + Dialog vincular/desvincular
│   ├── cliente/...
│   ├── funcionario/
│   │   ├── produtos/page.js         ✅ PRONTO (migrado para shadcn, exibe nome da empresa)
│   │   └── servicos/page.js         ✅ PRONTO (migrado para shadcn, exibe nome da empresa)
│   ├── login/page.js                ✅ PRONTO (redirect empresa → /empresa/dashboard, Sonner toast)
│   ├── register/page.js             ✅ PRONTO (campo empresaEmail para funcionários)
│   ├── page.js                      ⚠️ visual com classes CSS antigas
│   ├── layout.js                    ✅ PRONTO — Navbar + Toaster (Sonner)
│   └── globals.css                  ✅ PRONTO — Tailwind v4 com @theme (zinc/indigo), vars chart-1..5, sem @theme inline
├── prisma/
│   └── schema.prisma                ✅ PRONTO — schema completo sem imageUrl
├── tests/
│   ├── ... (22 arquivos, ver docs/test-results.md)
│   ├── authRoute.test.js            ✅ passando
│   ├── logoutRoute.test.js          ✅ passando
│   ├── registerRoute.test.js        ✅ passando (19 testes — email único, empresaEmail)
│   ├── meRoute.test.js              ✅ passando (7 testes — endereco, empresa)
│   ├── empresaFuncionariosRoute.test.js ✅ passando (18 testes)
│   └── empresaDashboardRoute.test.js ✅ passando (8 testes — 7 queries, agregações)
├── .github/workflows/ci.yml         ✅ PRONTO — job build + job test separados
├── proxy.js                         ✅ PRONTO — protege /empresa e /api/empresa, role empresa/funcionario/admin
├── components.json                  ✅ PRONTO — shadcn config (style default, aliases @/app/components)
├── postcss.config.mjs               ✅ PRONTO
├── next.config.mjs                  ⚠️ tem bloco turbopack manual que pode causar problema na Vercel
└── package.json                     ⚠️ falta postinstall e seed script
```

---

## O Que Está Pronto e Como Funciona

### Autenticação (`app/api/auth/`)

**Login** (`POST /api/auth/login`):
- Busca primeiro em `Funcionario` pelo email → role = `"funcionario"`
- Se não achar, busca em `Empresa` pelo email → role = `"empresa"`, `empresaId = principal.id`
- Se não achar, busca em `Usuario` → role = `"cliente"`
- Compara senha com bcrypt
- Assina JWT com `{ sub: id, email, name, role, empresaId? }`, expira em 8h
- Seta cookie httpOnly `agiliza_token` (secure em prod, sameSite lax)
- Retorna `{ success: true, user: { sub, email, name, role } }`
- Frontend salva user no `localStorage` como `agiliza_user`
- Empresa é redirecionada para `/empresa/dashboard`

**Register** (`POST /api/auth/register`):
- Campos: name, email, password, phone, cpf, empresaEmail (opcional para funcionários)
- Verifica email único nas 3 tabelas (`usuario`, `funcionario`, `empresa`) antes de criar
- Se `empresaEmail` informado, resolve para `empresaId` e cria `Funcionario` vinculado à empresa
- Cria `Endereco` placeholder automaticamente (obrigatório pelo schema)
- Hash bcrypt rounds 10

**Logout** (`POST /api/auth/logout`): deleta o cookie

**Me** (`GET /api/auth/me`): lê cookie e retorna payload do JWT

### Autorização (`proxy.js`)

Exporta `proxy` (não `middleware`) — mudança do Next.js 16.

Rotas protegidas:
- `/funcionario/*` e mutações em `/api/services` → exige `role === "funcionario"` ou `"admin"`
- `/empresa/*` e `/api/empresa/*` → exige `role === "empresa"`, `"funcionario"` ou `"admin"`
- `/cliente/*`, `/api/appointments/*`, `/api/cart/*`, `/api/orders/*` → exige qualquer usuário autenticado
- **GET em `/api/products` e `/api/services` é público** — qualquer um pode ver produtos/serviços sem login

Comportamento:
- Sem token em rota de API → `401 JSON`
- Sem token em rota de página → redirect para `/login?redirect=<caminho>`
- Role insuficiente em rota de página → redirect para `/`
- Com token válido → injeta headers `x-user-id`, `x-user-role`, `x-user-email` na request
- Para role empresa, headers também incluem `empresaId` (igual ao `principal.id` do JWT)

### APIs

Todas usam esse padrão:
```js
const useMemoryStore = process.env.NODE_ENV === "test"
// se true: usa arrays de app/data/store.js
// se false: usa Prisma + Supabase
```

**Cart** (`/api/cart`):
- GET: busca `Carrinho` do usuário pelo header `x-user-id`, cria se não existir
- POST: `{ produtoId, quantity }` ou `{ servicoId, quantity }` — incrementa se item já existe
- DELETE: `{ id }` (id do item `Itens`), verifica ownership pelo usuário

**Orders** (`/api/orders`):
- POST: pega carrinho do usuário, cria `Pedido` + `PedidoItem` para cada item, gera `invoiceNumber: "INV-{timestamp}"`, limpa os `Itens` do carrinho

**Appointments** (`/api/appointments`):
- POST: `{ serviceId, date, time }` — valida dia da semana contra `availableDays` do serviço, valida faixa de horário, verifica conflito de horário

### Empresa

**Dashboard** (`GET /api/empresa/dashboard`):
- Executa `prisma.$transaction` com 7 queries paralelas:
  - 4 counts: total de produtos, serviços, funcionários, agendamentos
  - 2 findMany agendamento: agrupa por dia (`agruparAgendamentosPorDia`) e por serviço (`agruparAgendamentosPorServico`)
  - 1 findMany pedidoItem: filtra por `produto.empresaId` + `pedido.status === "FINALIZADO"`, agrupa vendas por dia (`agruparVendasPorDia`)
- Retorna `{ totalProdutos, totalServicos, totalFuncionarios, totalAgendamentos, agendamentosPorDia, agendamentosPorServico, vendasPorDia }`

**Funcionários** (`/api/empresa/funcionarios`):
- GET: lista funcionários vinculados à empresa (nome, email, telefone, status)
- POST: `{ email }` — vincula funcionário existente (por email) à empresa
- DELETE: `{ id }` — desvincula funcionário da empresa (seta empresaId como null)

### Modo teste vs produção — CRÍTICO, NÃO QUEBRAR

Os testes do Vitest não têm ambiente Next.js, então `cookies()` e Prisma real não funcionam. O padrão `useMemoryStore` resolve isso. **Não remover essa lógica das rotas ao editar.**

O `cartRoute.test.js` passa um objeto `{ id, name, price }` diretamente no POST (formato antigo do in-memory store, que usa CartService.addItem). Já o formato de produção é `{ produtoId, quantity }`. Ambos coexistem pela flag `useMemoryStore`.

### Testes com falha conhecida

- `authRoute.test.js`: o teste foi escrito quando o login usava array hardcoded. Agora o login usa Prisma real, então o teste falha. **Precisa ser reescrito para mockar `../app/lib/prisma.js`** similar ao que `productsRoute.test.js` já faz com `vi.hoisted` e `vi.mock`.

- `logoutRoute.test.js`: chama `cookies()` do Next.js fora do contexto de request. A solução é mockar `next/headers` no teste.

---

## O Que Já Foi Feito (novas funcionalidades desde última versão)

### Branch `feature/email-unico-login-empresa` ✅ (mergada em develop)
- Login para empresas: busca `Funcionario` → `Empresa` → `Usuario`; JWT inclui `role: "empresa"` e `empresaId`
- Email único no register: verifica nas 3 tabelas antes de criar
- Cadastro de funcionário com `empresaEmail` opcional para vincular à empresa
- Navbar: links Dashboard, Funcionários, Produtos, Serviços para empresa
- Sonner: `<Toaster>` no layout, `toast.error()`/`toast.success()` em 6+ páginas, substituiu `useAlert.js` e `alert.jsx` (removidos)
- AlertDialog: 2 `confirm()` substituídos por Dialog em funcionario/produtos e funcionario/servicos
- Testes: registerRoute.test.js (19), meRoute.test.js (7) — todos passando

### Branch `feature/empresa-vincular-funcionario` ✅ (mergada em develop)
- API `/api/empresa/funcionarios`: GET lista, POST vincula por email, DELETE desvincula
- Página `/empresa/funcionarios`: tabela + Dialog vincular + Dialog confirmar desvincular
- Funcionário vê nome da empresa nos cabeçalhos de produtos/serviços
- Testes: empresaFuncionariosRoute.test.js (18) — passando

### Branch `feature/empresa-dashboard` ✅ (commits feitos, aguardando PR)
- Dashboard API: `$transaction` com 7 queries paralelas + agregações (agendamentos/dia, agendamentos/serviço, vendas/dia)
- Dashboard page: 4 cards métricos + bar chart (agendamentos/dia) + pie chart (agendamentos/serviço) + bar chart (vendas/dia, col-span-2)
- Shadcn chart component adicionado via CLI; recharts instalado; `components.json` configurado
- `globals.css` atualizado com vars `--color-chart-1..5`; removido `@theme inline`/`:root` que quebravam dark mode
- Testes: empresaDashboardRoute.test.js (8) — passando
- **344 testes, 22/22 arquivos, 100% coverage**
- CI dispara corretamente quando branch tem commits novos

## O Que Falta Fazer (em ordem de prioridade)

### 1. Finalizar branches abertas
- **`feature/empresa-dashboard`**: fazer PR para develop → revisar → merge
- **`docs/atualiza-docs`**: fazer PR para develop → revisar → merge (documentação atualizada neste commit)

### 2. Seed do banco (URGENTE — sem isso o MVP não tem nada pra mostrar)

Criar `prisma/seed.js` com:

```js
import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

// usar DIRECT_URL para seed
```

Conteúdo do seed:
- 1 `Endereco` → 1 `Empresa` (email: `empresa@agiliza.com`, senha: `123456`)
- 1 `Endereco` → 1 `Funcionario` (email: `funcionario@agiliza.com`, senha: `123456`, vinculado à empresa)
- 1 `Endereco` → 1 `Usuario` (email: `cliente@agiliza.com`, senha: `123456`)
- ~8 `Produto` da empresa com nome, descrição e preço realistas
- ~4 `Servico` da empresa com availableDays, startTime, endTime
- 1 agendamento passado, 1 pedido finalizado para popular dashboard

Adicionar no `package.json`:
```json
"prisma": { "seed": "node prisma/seed.js" },
"scripts": { "postinstall": "prisma generate" }
```

Rodar: `npx prisma db seed`

### 3. Migrar páginas restantes para shadcn + Tailwind

Páginas ainda com ⚠️ no diagrama:
1. `app/page.js` — home com hero section
2. `app/cliente/produtos/page.js` — grid de produtos
3. `app/cliente/carrinho/page.js` — carrinho
4. `app/cliente/pedidos/page.js` — lista de pedidos
5. `app/cliente/servicos/page.js` — grid de serviços
6. `app/cliente/agendamentos/page.js` — grid de agendamentos

Já migradas: Navbar, login, register, funcionario/produtos, funcionario/servicos

### 4. Ajustar `next.config.mjs`

Remover o bloco `turbopack: { root: __dirname }` — foi adicionado manualmente e pode causar problemas na Vercel.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
export default nextConfig
```

### 5. CI — adicionar `prisma generate` antes do build

No `.github/workflows/ci.yml`, o job de build precisa do client Prisma gerado. Adicionar step:
```yaml
- name: Generate Prisma Client
  run: npx prisma generate
```
antes do `npm run build`. O job de testes **não precisa** porque os testes mockam o Prisma.

### 6. CI — usar `vitest run` em vez de `vitest`

O script `npm test` atualmente executa `vitest` (modo watch), que pode travar no CI. Mudar para `vitest run` no CI ou criar script separado:
```json
"scripts": {
  "test": "vitest",
  "test:ci": "vitest run"
}
```

---

## Detalhes Técnicos Críticos

### Prisma Client
- Gerado em `generated/prisma/` (configurado no schema: `output = "../generated/prisma"`)
- Import: `import { PrismaClient } from "../../generated/prisma/client"`
- Instância singleton via `globalThis.prisma` para evitar múltiplas conexões em dev
- Usa `PrismaPg` adapter com `connectionString: process.env.DATABASE_URL`
- Para migrations usar `DIRECT_URL` (sem pgbouncer)

### Schema Prisma — pontos importantes
- `Usuario` e `Funcionario` são entidades separadas (não há campo `role` no banco — o role é determinado em qual tabela o registro existe)
- `Endereco` é obrigatório ao criar `Usuario` ou `Funcionario` — o register cria um placeholder
- `Produto` tem exclusão lógica via campo `active: Boolean @default(true)` — DELETE faz `update({ active: false })`, não deleta de verdade
- `Servico` tem `availableDays String[]` — array de strings como `["segunda", "terca", "sexta"]`
- `Agendamento` tem unique constraint `@@unique([servicoId, scheduledAt])` — impede duplo agendamento
- `Pedido` tem `invoiceNumber String?` gerado como `"INV-{Date.now()}"`
- `Itens` referencia `Carrinho` + opcionalmente `Produto` ou `Servico`
- `PedidoItem` guarda snapshot de nome/preço no momento da compra (não referencia direto)

### Dias da semana nos serviços
Os valores válidos para `availableDays` são exatamente: `"segunda"`, `"terca"`, `"quarta"`, `"quinta"`, `"sexta"`, `"sabado"`, `"domingo"`. A validação de agendamento usa `new Date(\`${date}T00:00:00\`).getDay()` mapeado para esses valores.

### Fluxo completo de autenticação no frontend
1. `POST /api/auth/login` → servidor seta cookie httpOnly + retorna `{ user: payload }`
2. Frontend: `localStorage.setItem("agiliza_user", JSON.stringify(data.user))`
3. Navbar lê `localStorage` a cada mudança de pathname para atualizar links/nome
4. Requests protegidas: o cookie é enviado automaticamente pelo browser
5. `POST /api/auth/logout` → servidor deleta cookie
6. Frontend: `localStorage.removeItem("agiliza_user")` + redirect para `/login`

### Por que localStorage para o user?
O cookie é httpOnly (não acessível pelo JS), então o frontend não consegue ler o JWT direto. Por isso o payload do usuário é duplicado no localStorage apenas para fins de UI (mostrar nome, mudar links por role). A segurança real vem do cookie verificado no proxy.js.

### Componentes shadcn disponíveis
Todos em `app/components/ui/`, importar com caminho relativo ou `@/app/components/ui/`:

**Button** — `variant`: `default`(indigo), `destructive`(vermelho), `outline`, `secondary`(zinc-800), `ghost`, `link` | `size`: `default`, `sm`, `lg`, `icon`

**Card** + `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Badge** — `variant`: `default`(indigo), `secondary`, `destructive`, `outline`, `success`(verde), `warning`(amarelo)

**Input** — tema escuro zinc-800

**Dialog** + `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogClose`

**Chart** — `ChartContainer`, `ChartTooltip`, `ChartLegend`, `ChartConfig` (shadcn chart + recharts)

**Label**, **Separator**

**cn()** — `import { cn } from "@/app/lib/utils"`

**sonner** — `<Toaster />` no layout, `toast.success()`/`toast.error()` nas páginas

**lucide-react** — `import { ShoppingCart, Package, Calendar, ... } from "lucide-react"`

### Tailwind v4 — diferenças da v3
- `@import "tailwindcss"` (não `@tailwind base; @tailwind components; @tailwind utilities`)
- Tema customizado via `@theme { --color-primary: ...; }` no CSS
- Não tem `tailwind.config.js` — tudo no CSS
- Classes de opacidade como `bg-white/8` funcionam normalmente
- `border-white/8` equivale a `border: 1px solid rgba(255,255,255,0.08)`
- **Chart vars**: `--color-chart-1..5` definidas em `@theme` e replicadas em `.dark`; NÃO usar `@theme inline` + `:root` juntos (conflita com dark mode)
- **`npm test`** atualmente executa `vitest` (modo watch) — para CI usar `vitest run` ou criar script `test:ci`

---

## Comandos

```bash
npm run dev           # desenvolvimento local
npm run build         # build produção
npm test              # vitest (usa in-memory, não precisa de banco)
npm run coverage      # cobertura de testes
npx prisma generate   # regenerar client após mudar schema
npx prisma migrate dev --name <nome>  # nova migration (usa DIRECT_URL)
npx prisma db seed    # rodar seed (após criar prisma/seed.js)
npx prisma studio     # GUI do banco
```

---

## Resultado Final Esperado

- Home pública com hero e cards de features
- `/cliente/produtos` — público, qualquer um vê os produtos seedados no banco
- `/login` e `/register` — públicos
- Após login como cliente: acesso a carrinho, pedidos, serviços, agendamentos
- Após login como funcionário: acesso a gerenciamento de produtos e serviços (vinculados à empresa)
- Após login como empresa: Dashboard com métricas e gráficos, gerenciamento de funcionários
- Visual dark marketplace consistente com shadcn + Tailwind em todas as páginas
- Build passando na Vercel
- Testes passando no CI com 100% de cobertura
- 22 arquivos de teste, 344 testes
