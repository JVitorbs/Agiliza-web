# Tecnologias

## Runtime & Framework

| Tecnologia | Versão | Propósito |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20+ | Runtime JavaScript |
| [Next.js](https://nextjs.org/) | 16.2.6 | Framework full-stack com App Router e Turbopack |
| [React](https://react.dev/) | 19.2.6 | Biblioteca de componentes de UI |

Next.js está configurado com **App Router** (diretório `app/`). Não usar Pages Router. O desenvolvimento usa **Turbopack** (habilitado por padrão no Next.js 16 em modo dev).

## Frontend

| Tecnologia | Versão | Propósito |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Estilização utilitária |
| [shadcn/ui](https://ui.shadcn.com/) | — | Componentes baseados em Radix UI, copiados manualmente para `app/components/ui/` |
| [Radix UI](https://www.radix-ui.com/) | — | Primitivos de acessibilidade (Dialog, Popover, etc.) |
| [Lucide React](https://lucide.dev/) | — | Ícones |
| [class-variance-authority](https://cva.style/) | — | Variantes de componentes (cva) |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | — | Combinação e merge de classes (`cn()`) |

### Componentes shadcn/ui disponíveis

Todos em `app/components/ui/`:

- **Button** — variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; sizes: `default`, `sm`, `lg`, `icon`
- **Card** — + `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Badge** — variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`
- **Input** — tema escuro zinc-800
- **Dialog** — + `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogClose`
- **Alert** — variants: `default`, `destructive`, `success`
- **Label**, **Separator**, **Tabs**, **Popover**

### Tailwind CSS v4 — diferenças da v3

- `@import "tailwindcss"` (não `@tailwind base; @tailwind components; @tailwind utilities`)
- Tema customizado via `@theme {}` no CSS (não há `tailwind.config.js`)
- Classes de opacidade como `bg-white/8` funcionam normalmente

O tema atual usa `zinc` como cor neutra e `indigo` como cor primária, com suporte a dark mode.

## Backend & Banco

| Tecnologia | Versão | Propósito |
|---|---|---|
| [Prisma](https://www.prisma.io/) | 7.8.0 | ORM e migrations |
| [@prisma/adapter-pg](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/drivers) | — | Driver adaptador para PostgreSQL |
| [pg](https://node-postgres.com/) | — | Driver PostgreSQL nativo |
| [Supabase](https://supabase.com/) | — | Hospedagem do banco PostgreSQL |
| [Zod](https://zod.dev/) | — | Validação de schemas (formulários de registro/login) |

### Prisma

- Client gerado em `generated/prisma/` (não em `node_modules/`)
- Import: `import { PrismaClient } from "../../generated/prisma/client"`
- Instância singleton via `globalThis.prisma` para evitar múltiplas conexões em dev
- Usa `PrismaPg` adapter com `connectionString: process.env.DATABASE_URL`
- Migrations usam `DIRECT_URL` (conexão direta, sem PgBouncer)

## Autenticação

| Tecnologia | Versão | Propósito |
|---|---|---|
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | — | Hash de senhas |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | — | Criação de JWT (login) |
| [jose](https://github.com/panva/jose) | — | Verificação de JWT no Edge Runtime (proxy.js) |

- JWT armazenado em cookie httpOnly `agiliza_token`
- Payload: `{ sub, email, name, role, empresaId? }`, expira em 8h
- Middleware `proxy.js` verifica o token e injeta headers `x-user-id`, `x-user-role`, `x-user-email`

## Testes

| Tecnologia | Versão | Propósito |
|---|---|---|
| [Vitest](https://vitest.dev/) | 4.1.7 | Runner de testes |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | — | Renderização de componentes em teste |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | — | Matchers customizados para DOM |
| [jsdom](https://github.com/jsdom/jsdom) | — | Ambiente DOM simulado |

- 21 arquivos de teste, 310 testes
- Cobertura atual: ~99% statements, 100% branches (excluindo código gerado pelo Prisma)
- Modo in-memory para testes (usa `app/data/store.js` em vez de Prisma)
- Prisma é mockado com `vi.hoisted` + `vi.mock`

## CI/CD

| Tecnologia | Propósito |
|---|---|
| [GitHub Actions](https://docs.github.com/en/actions) | Integração contínua |

Pipeline em `.github/workflows/ci.yml`:
1. **build**: `npm ci` + `npx prisma generate` + `npm run build`
2. **lint**: `npm ci` + `npm run lint`
3. **test**: `npm ci` + `npm test`

Executa em push/PR para `main`, `develop` e `ci/*`.

## Scripts (package.json)

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento local (Next.js + Turbopack) |
| `npm run build` | Build de produção |
| `npm start` | Iniciar servidor de produção |
| `npm test` | Rodar testes (Vitest) |
| `npm run coverage` | Rodar testes com cobertura |
| `npm run lint` | Verificar lint (ESLint) |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npx prisma migrate dev --name <nome>` | Criar nova migration |
| `npx prisma db seed` | Popular banco com dados iniciais |
| `npx prisma studio` | GUI do banco de dados |
