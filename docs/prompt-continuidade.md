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
- **shadcn/ui** — componentes criados manualmente (CLI do shadcn não funciona com Next.js 16)
- **Prisma 7** com `@prisma/adapter-pg` + `pg` — client gerado em `generated/prisma/` (não em `node_modules`)
- **PostgreSQL no Supabase** — já configurado e rodando, `.env` já tem todas as variáveis
- **JWT** via `jsonwebtoken` + cookie httpOnly `agiliza_token` — autorização em `proxy.js`
- **bcryptjs** para hash de senha
- **jose** para verificação de JWT no Edge Runtime (proxy.js)
- **Vitest** para testes (não Jest) — modo in-memory para testes, Prisma para produção
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
│   │   │   ├── login/route.js       ✅ PRONTO
│   │   │   ├── logout/route.js      ✅ PRONTO
│   │   │   ├── register/route.js    ✅ PRONTO
│   │   │   └── me/route.js          ✅ PRONTO
│   │   ├── products/route.js        ✅ PRONTO (GET público, mutações requer funcionário)
│   │   ├── services/route.js        ✅ PRONTO (GET público, mutações requer funcionário)
│   │   ├── cart/route.js            ✅ PRONTO (Prisma em prod, in-memory em teste)
│   │   ├── orders/route.js          ✅ PRONTO (Prisma em prod, in-memory em teste)
│   │   └── appointments/route.js    ✅ PRONTO (Prisma em prod, in-memory em teste)
│   ├── components/
│   │   ├── Navbar.jsx               ⚠️ FUNCIONA mas usa classes CSS antigas, migrar para Tailwind
│   │   └── ui/
│   │       ├── button.jsx           ✅ PRONTO — shadcn Button
│   │       ├── card.jsx             ✅ PRONTO — shadcn Card + subcomponentes
│   │       ├── badge.jsx            ✅ PRONTO — shadcn Badge
│   │       ├── input.jsx            ✅ PRONTO — shadcn Input
│   │       ├── dialog.jsx           ✅ PRONTO — shadcn Dialog
│   │       ├── label.jsx            ✅ PRONTO — shadcn Label
│   │       └── separator.jsx        ✅ PRONTO — shadcn Separator
│   ├── lib/
│   │   ├── prisma.js                ✅ PRONTO — singleton com PrismaPg adapter
│   │   └── utils.js                 ✅ PRONTO — cn() helper (clsx + tailwind-merge)
│   ├── services/
│   │   ├── ProductService.js        ✅ PRONTO — validateProduct()
│   │   ├── CartService.js           ✅ PRONTO — addItem(), removeItem(), calculateTotal()
│   │   ├── AppointmentService.js    ✅ PRONTO — validateDate(), validateConflict(), validateAppointment()
│   │   └── ServiceService.js        ✅ PRONTO — validateService() com dias/horários
│   ├── data/store.js                ✅ PRONTO — arrays in-memory para testes
│   ├── cliente/
│   │   ├── produtos/page.js         ⚠️ LÓGICA OK, visual com classes CSS antigas
│   │   ├── carrinho/page.js         ⚠️ LÓGICA OK, visual com classes CSS antigas
│   │   ├── pedidos/page.js          ⚠️ LÓGICA OK, visual com classes CSS antigas
│   │   ├── servicos/page.js         ⚠️ LÓGICA OK, visual com classes CSS antigas
│   │   └── agendamentos/page.js     ⚠️ LÓGICA OK, visual com classes CSS antigas
│   ├── funcionario/
│   │   ├── produtos/page.js         ⚠️ LÓGICA OK, visual com classes CSS antigas
│   │   └── servicos/page.js         ⚠️ LÓGICA OK, visual com classes CSS antigas
│   ├── login/page.js                ⚠️ LÓGICA OK, visual com classes CSS antigas
│   ├── register/page.js             ⚠️ LÓGICA OK, visual com classes CSS antigas
│   ├── page.js                      ⚠️ LÓGICA OK, visual com classes CSS antigas
│   ├── layout.js                    ✅ PRONTO — importa Navbar + globals.css
│   └── globals.css                  ✅ PRONTO — Tailwind v4 com @theme dark (zinc/indigo)
├── prisma/
│   └── schema.prisma                ✅ PRONTO — schema completo sem imageUrl
├── tests/
│   ├── ProductService.test.js       ✅ passando
│   ├── CartService.test.js          ✅ passando
│   ├── AppointmentService.test.js   ✅ passando
│   ├── productsRoute.test.js        ✅ passando
│   ├── cartRoute.test.js            ✅ passando
│   ├── ordersRoute.test.js          ✅ passando
│   ├── appointmentsRoute.test.js    ✅ passando
│   ├── authRoute.test.js            ❌ falha — testa login com array hardcoded antigo (admin@agiliza.com/123456), precisa atualizar para mockar Prisma
│   └── logoutRoute.test.js          ❌ falha — chama cookies() fora do contexto Next.js, problema estrutural
├── .github/workflows/ci.yml         ✅ PRONTO — job build + job test separados
├── proxy.js                         ✅ PRONTO — substitui middleware.js no Next.js 16
├── postcss.config.mjs               ✅ PRONTO
├── next.config.mjs                  ⚠️ tem bloco turbopack manual que pode causar problema na Vercel
└── package.json                     ⚠️ falta postinstall e seed script
```

---

## O Que Está Pronto e Como Funciona

### Autenticação (`app/api/auth/`)

**Login** (`POST /api/auth/login`):
- Busca primeiro em `Funcionario` pelo email → role = `"funcionario"`
- Se não achar, busca em `Usuario` → role = `"cliente"`
- Compara senha com bcrypt
- Assina JWT com `{ sub: id, email, name, role }`, expira em 8h
- Seta cookie httpOnly `agiliza_token` (secure em prod, sameSite lax)
- Retorna `{ success: true, user: { sub, email, name, role } }`
- Frontend salva user no `localStorage` como `agiliza_user`

**Register** (`POST /api/auth/register`):
- Campos: name, email, password, phone, cpf
- Cria `Endereco` placeholder automaticamente (obrigatório pelo schema)
- Hash bcrypt rounds 10

**Logout** (`POST /api/auth/logout`): deleta o cookie

**Me** (`GET /api/auth/me`): lê cookie e retorna payload do JWT

### Autorização (`proxy.js`)

Exporta `proxy` (não `middleware`) — mudança do Next.js 16.

Rotas protegidas:
- `/funcionario/*` e mutações em `/api/services` → exige `role === "funcionario"` ou `"admin"`
- `/cliente/*`, `/api/appointments/*`, `/api/cart/*`, `/api/orders/*` → exige qualquer usuário autenticado
- **GET em `/api/products` e `/api/services` é público** — qualquer um pode ver produtos/serviços sem login

Comportamento:
- Sem token em rota de API → `401 JSON`
- Sem token em rota de página → redirect para `/login?redirect=<caminho>`
- Role insuficiente em rota de página → redirect para `/`
- Com token válido → injeta headers `x-user-id`, `x-user-role`, `x-user-email` na request

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

### Modo teste vs produção — CRÍTICO, NÃO QUEBRAR

Os testes do Vitest não têm ambiente Next.js, então `cookies()` e Prisma real não funcionam. O padrão `useMemoryStore` resolve isso. **Não remover essa lógica das rotas ao editar.**

O `cartRoute.test.js` passa um objeto `{ id, name, price }` diretamente no POST (formato antigo do in-memory store, que usa CartService.addItem). Já o formato de produção é `{ produtoId, quantity }`. Ambos coexistem pela flag `useMemoryStore`.

### Testes com falha conhecida

- `authRoute.test.js`: o teste foi escrito quando o login usava array hardcoded. Agora o login usa Prisma real, então o teste falha. **Precisa ser reescrito para mockar `../app/lib/prisma.js`** similar ao que `productsRoute.test.js` já faz com `vi.hoisted` e `vi.mock`.

- `logoutRoute.test.js`: chama `cookies()` do Next.js fora do contexto de request. A solução é mockar `next/headers` no teste.

---

## O Que Falta Fazer (em ordem de prioridade)

### 1. Seed do banco (URGENTE — sem isso o MVP não tem nada pra mostrar)

Criar `prisma/seed.js` com:

```js
import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

// usar DIRECT_URL para seed
```

Conteúdo do seed:
- 1 `Endereco` → 1 `Funcionario` (email: `funcionario@agiliza.com`, senha: `123456`, isManager: true)
- 1 `Endereco` → 1 `Usuario` (email: `cliente@agiliza.com`, senha: `123456`)
- ~8 `Produto` com nome, descrição e preço realistas (ex: loja de conveniência — água, refrigerante, salgadinho, chocolate, café, biscoito, energético, bala)
- ~4 `Servico` com availableDays, startTime, endTime (ex: Corte Masculino, Manicure, Hidratação Capilar, Barba)

Adicionar no `package.json`:
```json
"prisma": { "seed": "node prisma/seed.js" },
"scripts": { "postinstall": "prisma generate" }
```

Rodar: `npx prisma db seed`

### 2. Migrar todas as páginas para shadcn + Tailwind

Todas as páginas marcadas com ⚠️ acima têm a **lógica correta** mas ainda usam classes CSS customizadas antigas (`.btn`, `.card`, `.page`, `.modal-overlay`, etc.) que existiam no globals.css anterior. O globals.css atual **só tem Tailwind v4**, então essas classes não existem mais e as páginas ficam sem estilo.

**A tarefa é reescrever o JSX de cada página usando:**
- Componentes de `app/components/ui/` (Button, Card, CardHeader, CardContent, Badge, Input, Dialog, Label, Separator)
- Classes Tailwind diretamente (ex: `className="flex items-center gap-4 p-6"`)
- `lucide-react` para ícones (já instalado)

**Não mudar a lógica** (fetches, estados, handlers) — só o JSX/visual.

**Visual alvo:** dark marketplace moderno, estilo Vercel Dashboard ou shadcn/ui demo. Tema: zinc escuro + indigo como cor primária.

Páginas para migrar:
1. `app/components/Navbar.jsx` — barra fixa no topo, logo "A" + "Agiliza", links por role, contador de carrinho, botões Entrar/Cadastrar ou nome do usuário + Sair
2. `app/page.js` — home com hero section, 3 cards de features (Comprar, Agendar, Pedidos), CTA para área do funcionário
3. `app/login/page.js` — card centralizado na tela, logo, form email+senha, link para cadastro
4. `app/register/page.js` — card centralizado, form com grid CPF/telefone, link para login
5. `app/cliente/produtos/page.js` — grid de 4 colunas de cards de produto, barra de busca, botão "Adicionar ao carrinho" em cada card. **Ver produtos NÃO requer login**, mas adicionar ao carrinho redireciona para login se não autenticado
6. `app/cliente/carrinho/page.js` — lista de itens + painel sticky com resumo e total + botão finalizar
7. `app/cliente/pedidos/page.js` — lista de pedidos com Badge de status (FINALIZADO=verde, ABERTO=amarelo, CANCELADO=vermelho), data formatada em pt-BR, número da NF
8. `app/cliente/servicos/page.js` — grid de cards de serviço, ao clicar abre painel lateral sticky com seletor de data/hora e botão confirmar
9. `app/cliente/agendamentos/page.js` — grid de cards com nome do serviço, data e hora formatados
10. `app/funcionario/produtos/page.js` — tabela com colunas Produto/Descrição/Preço/Ações, Dialog modal para criar/editar (campos: Nome, Descrição, Preço)
11. `app/funcionario/servicos/page.js` — tabela similar, Dialog com campos: Nome, Descrição, Preço, Dias disponíveis (botões toggle para cada dia da semana), Horário início/fim

### 3. Corrigir testes com falha

**`authRoute.test.js`** — reescrever para mockar Prisma, similar ao `productsRoute.test.js`:
```js
const mockPrisma = vi.hoisted(() => ({
  funcionario: { findUnique: vi.fn() },
  usuario: { findUnique: vi.fn() },
}))
vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))
```
Também mockar `next/headers` (o `cookies()`) e `jsonwebtoken`.
Testar: login válido como funcionário, login válido como cliente, credenciais inválidas, campos faltando.

**`logoutRoute.test.js`** — mockar `next/headers`:
```js
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ delete: vi.fn() }))
}))
```

### 4. Ajustar `next.config.mjs`

Remover o bloco `turbopack: { root: __dirname }` — foi adicionado manualmente e pode causar problemas na Vercel. O Next.js 16 já usa Turbopack por padrão em dev.

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

**Label**, **Separator**

**cn()** — `import { cn } from "@/app/lib/utils"`

**lucide-react** — `import { ShoppingCart, Package, Calendar, ... } from "lucide-react"`

### Tailwind v4 — diferenças da v3
- `@import "tailwindcss"` (não `@tailwind base; @tailwind components; @tailwind utilities`)
- Tema customizado via `@theme { --color-primary: ...; }` no CSS
- Não tem `tailwind.config.js` — tudo no CSS
- Classes de opacidade como `bg-white/8` funcionam normalmente
- `border-white/8` equivale a `border: 1px solid rgba(255,255,255,0.08)`

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
- Após login como funcionário: acesso a gerenciamento de produtos e serviços
- Visual dark marketplace consistente com shadcn + Tailwind em todas as páginas
- Build passando na Vercel
- Testes passando no CI com ≥60% de cobertura
