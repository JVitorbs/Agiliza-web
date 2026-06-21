# Arquitetura

## Visão Geral

Agiliza é uma aplicação full-stack construída com Next.js 16 App Router. O backend e frontend estão no mesmo projeto: o diretório `app/api/` contém as rotas de API (backend), e os demais diretórios em `app/` são páginas React (frontend). A autenticação é feita via JWT armazenado em cookie httpOnly, verificada por um middleware Edge Runtime (`proxy.js`).

```mermaid
graph LR
    Browser["🌐 Browser"] --> Next["Next.js Edge<br/>(proxy.js)"]
    Next --> API["API Route<br/>app/api/**/route.js"]
    API --> Service["Service Layer<br/>app/services/"]
    Service --> Prisma["Prisma ORM<br/>(produção)"]
    Service --> Store["In-Memory Store<br/>(teste)"]
    Prisma --> PG[("PostgreSQL<br/>Supabase")]
```

## Estrutura de Camadas

### 1. Middleware (`proxy.js`)

Roda no Edge Runtime do Next.js para todas as requisições a rotas protegidas (definidas no `config.matcher`). Funções:

- Verificar JWT do cookie `agiliza_token` usando `jose`
- Rotas públicas: GET em `/api/products` e `/api/services`, páginas `/cliente/produtos` e `/cliente/servicos`
- Rotas de funcionário: `/funcionario/*`, `/api/services` (mutação), `/api/products` (mutação) — exigem role `funcionario` ou `admin`
- Rotas de empresa: `/api/empresa/*`, `/empresa/*` — exigem role `empresa`, `funcionario` ou `admin`
- Rotas autenticadas: `/api/appointments`, `/api/cart`, `/api/orders`, `/api/cliente`, `/cliente/carrinho`, `/cliente/pedidos`, `/cliente/agendamentos` — exigem qualquer usuário logado
- Injeta headers `x-user-id`, `x-user-role`, `x-user-email` na request quando o token é válido

Sem token:
- Rota de API → retorna `401` JSON
- Rota de página → redireciona para `/login?redirect=<path>`

### 2. API Routes (`app/api/**/route.js`)

Cada rota exporta funções nomeadas (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) que recebem `Request` e retornam `Response`. Padrão interno:

```js
const useMemoryStore = process.env.NODE_ENV === "test"
```

Quando `useMemoryStore` é `true` (ambiente de teste), as operações usam arrays em memória de `app/data/store.js`. Quando `false` (produção/desenvolvimento), usam Prisma.

As rotas leem os headers injetados pelo `proxy.js` para identificar o usuário:
- `request.headers.get("x-user-id")` — ID do usuário autenticado
- `request.headers.get("x-user-role")` — role (`cliente` ou `funcionario`)
- `request.headers.get("x-user-email")` — email do usuário

### 3. Serviços (`app/services/`)

Camada de validação e regras de negócio, separada das rotas para testabilidade:

| Classe | Métodos | Responsabilidade |
|---|---|---|
| `ProductService` | `validateProduct(data)` | Validar nome, preço, descrição de produto |
| `ServiceService` | `validateService(data)` | Validar nome, preço, dias/horários disponíveis |
| `CartService` | `addItem()`, `removeItem()`, `calculateTotal()` | Operações no carrinho in-memory |
| `AppointmentService` | `validateDate()`, `validateConflict()`, `validateAppointment()` | Validações de agendamento |

### 4. Acesso a Dados

**Produção**: Prisma Client conectado ao PostgreSQL no Supabase via `@prisma/adapter-pg`.

**Teste**: Arrays em memória em `app/data/store.js`. Cada rota decide qual usar baseado em `process.env.NODE_ENV`.

```js
// Prisma — singleton
import { PrismaClient } from "../../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = globalThis.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
```

### 5. Frontend (Páginas)

Páginas React com Server Components (padrão) e Client Components (quando necessário para interatividade).

**Client Components**: `Navbar.jsx`, `ThemeToggle.jsx`, componentes de página com `"use client"` (carrinho, pedidos, formulários, etc.)

**Páginas públicas**: Landing page (`/`), produtos (`/cliente/produtos`), serviços (`/cliente/servicos`), login (`/login`), registro (`/register`)

**Páginas autenticadas (cliente)**: Carrinho (`/cliente/carrinho`), pedidos (`/cliente/pedidos`), agendamentos (`/cliente/agendamentos`), configurações (`/cliente/configuracoes`)

**Páginas de funcionário**: Gerenciar produtos (`/funcionario/produtos`), gerenciar serviços (`/funcionario/servicos`)

**Páginas de empresa**: Dashboard (`/empresa/dashboard`) com cards métricos e gráficos, gerenciar funcionários (`/empresa/funcionarios`)

## Fluxo de Autenticação

### Login

```mermaid
sequenceDiagram
    actor U as Usuário
    participant Front as Frontend<br/>(Página)
    participant API as POST /api/auth/login
    participant BCrypt as bcrypt
    participant DB as PostgreSQL

    U->>Front: Preenche email + senha
    Front->>API: POST { email, password }

    API->>DB: findUnique Funcionario(email)
    alt Funcionario encontrado
        DB-->>API: { id, email, name, password, empresaId }
        API->>API: role = "funcionario"
    else Não encontrado
        API->>DB: findUnique Usuario(email)
        DB-->>API: { id, email, name, password }
        API->>API: role = "cliente"
    end

    API->>BCrypt: compare(password, hash)
    BCrypt-->>API: true

    API->>API: Gera JWT { sub, email, name, role, empresaId? }
    API->>API: Seta cookie httpOnly agiliza_token
    API-->>Front: { success: true, user: { sub, email, name, role } }
    Front->>Front: localStorage.setItem("agiliza_user", ...)
    Front-->>U: Redireciona para página inicial
```

### Requisição Autenticada

```mermaid
sequenceDiagram
    actor U as Usuário
    participant Proxy as proxy.js<br/>(Edge)
    participant API as API Route
    participant Service as Service Layer

    U->>Proxy: Navega para rota protegida<br/>(cookie enviado automaticamente)
    Proxy->>Proxy: jwtVerify(token, JWT_SECRET)
    alt Token válido
        Proxy->>Proxy: Injeta headers x-user-id, x-user-role, x-user-email
        Proxy->>API: Request com headers extras
        API->>Service: Processa requisição
        Service-->>API: Resultado
        API-->>U: Response 200
    else Token inválido/ausente
        alt Rota de API
            Proxy-->>U: 401 { error: "Não autenticado" }
        else Rota de página
            Proxy-->>U: Redirect /login?redirect=<path>
        end
    end
```

### Logout

```mermaid
sequenceDiagram
    actor U as Usuário
    participant Front as Frontend
    participant API as POST /api/auth/logout

    U->>Front: Clica em "Sair"
    Front->>API: POST /api/auth/logout
    API->>API: Deleta cookie agiliza_token
    API-->>Front: { success: true }
    Front->>Front: localStorage.removeItem("agiliza_user")
    Front-->>U: Redirect /login
```

### Proteção de Rotas (proxy.js)

```mermaid
flowchart TD
    REQ["Requisição chega"] --> PUB{É rota<br/>pública?}
    PUB -->|"GET /api/products<br/>GET /api/services<br/>/cliente/produtos<br/>/cliente/servicos"| NEXT["NextResponse.next()"]
    
    PUB -->|Não| EMP{É rota de<br/>funcionário?}
    EMP -->|"/funcionario/*<br/>POST/PUT/DELETE<br/>/api/products<br/>/api/services"| AUTH
    EMP -->|"Rotas autenticadas<br/>(carrinho, pedidos,<br/>agendamentos, perfil)"| AUTH
    
    AUTH["Tem cookie<br/>agiliza_token?"]
    AUTH -->|Não| API1{É rota<br/>de API?}
    API1 -->|Sim| 401["401 { error }"]
    API1 -->|Não| REDIR["Redirect /login"]
    
    AUTH -->|Sim| VERIF["jwtVerify(token)"]
    VERIF -->|Inválido| API1
    
    VERIF -->|Válido| ROLE{É rota de<br/>funcionário?}
    ROLE -->|Sim| CHECK{role é<br/>funcionario<br/>ou admin?}
    CHECK -->|Não| FORB["403 { error }<br/>ou redirect /"]
    CHECK -->|Sim| INJECT["Injeta headers<br/>x-user-id, x-user-role,<br/>x-user-email"]
    ROLE -->|Não| INJECT
    
    INJECT --> NEXT
```

### Por que localStorage para o user?

O cookie é httpOnly (não acessível por JavaScript). O frontend não consegue ler o JWT para exibir nome e links por role. Por isso o payload é duplicado no `localStorage` apenas para UI. A segurança real vem do cookie verificado no proxy.js.

## Componentes e UI

- Componentes compartilhados em `app/components/` (Navbar, Footer, Logo, ThemeToggle)
- Componentes shadcn/ui em `app/components/ui/` — importar com caminho relativo ou `@/app/components/ui/`
- Utilitário `cn()` em `app/lib/utils.js` para mesclar classes (`clsx` + `tailwind-merge`)
- Notificações toast via `sonner` (`<Toaster />` no layout raiz, `toast.error()`/`toast.success()` nas páginas) — substitui o antigo hook `useAlert.js` que foi removido
- Gráficos do dashboard com `recharts` + componente `Chart` (shadcn/ui) em `app/components/ui/chart.jsx`

## Aliases de Import

Configurado em `vitest.config.js` e `jsconfig.json`:

```js
"@/*" → "./*"
```

Uso: `import { Button } from "@/app/components/ui/button"`

## Modo Teste vs Produção

**CRÍTICO**: O padrão `useMemoryStore` não deve ser removido. Testes do Vitest não têm ambiente Next.js completo — `cookies()` e Prisma real não funcionam. Cada rota de API verifica `process.env.NODE_ENV === "test"` para decidir se usa a store in-memory ou o Prisma.

As rotas têm duas implementações que coexistem:
- Cart: in-memory usa `{ id, name, price }` diretamente; produção usa `{ produtoId, quantity }`
- Orders/Appointments: mesma lógica de negócio, mudando apenas a origem dos dados

## Schema do Banco

15 modelos no total. Principais entidades e seus relacionamentos:

```mermaid
erDiagram
    Empresa ||--o{ Funcionario : possui
    Empresa ||--o{ Produto : oferece
    Empresa ||--o{ Servico : oferece
    Empresa ||--|| Endereco : endereco

    Funcionario ||--|| Endereco : endereco
    Funcionario }o--|| Empresa : vinculado

    Usuario ||--o{ Carrinho : possui
    Usuario ||--o{ Pedido : realiza
    Usuario ||--o{ Agendamento : agenda
    Usuario ||--|| Endereco : endereco

    Carrinho ||--o{ Itens : contem
    Itens }o--o| Produto : referencia
    Itens }o--o| Servico : referencia

    Pedido ||--o{ PedidoItem : contem
    PedidoItem }o--o| Produto : snapshot
    PedidoItem }o--o| Servico : snapshot

    Servico ||--o{ Agendamento : agendado

    Pedido ||--o{ Pagamento : registra
    Pagamento }o--o| Produto : opcional
    Pagamento }o--o| Servico : opcional
    Pagamento }o--o| Usuario : pagador

    Endereco ||--o{ Entrega : destino
    Produto ||--o{ Entrega : entregue
    Usuario }o--o{ Entrega : recebe
```

| Entidade | Descrição |
|---|---|
| `Usuario` | Cliente da plataforma |
| `Funcionario` | Funcionário vinculado a uma `Empresa` |
| `Empresa` | Empresa dona dos produtos e serviços |
| `Produto` | Produto à venda (exclusão lógica via `active`) |
| `Servico` | Serviço agendável (com `availableDays`, `startTime`, `endTime`) |
| `Carrinho` + `Itens` | Carrinho de compras do usuário |
| `Pedido` + `PedidoItem` | Pedido finalizado com snapshot de preços |
| `Agendamento` | Agendamento de serviço (unique: servicoId + scheduledAt) |
| `Pagamento` | Registro de pagamento |
| `Endereco` | Endereço compartilhado entre Usuario, Funcionario, Empresa |
| `Entrega` | Entrega de produto em endereço |
| `Auditoria` | Log de alterações em dados sensíveis |

Schema completo em `prisma/schema.prisma`.
