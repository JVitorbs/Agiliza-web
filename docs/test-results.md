# Testes

## Configuração

O projeto usa [Vitest](https://vitest.dev/) 4.1.7 como runner de testes, com as seguintes configurações em `vitest.config.js`:

- **Ambiente**: `jsdom` (simula DOM do navegador)
- **Globais**: ativadas (`vi`, `describe`, `it`, `expect` disponíveis sem import)
- **Setup**: `tests/setup.js` (importa `@testing-library/jest-dom`)
- **Inclusão**: `tests/**/*.test.{js,jsx,ts,tsx}`

## Execução

| Comando | Descrição |
|---|---|
| `npm test` | Rodar todos os testes |
| `npm run coverage` | Rodar testes com relatório de cobertura |
| `npx vitest run tests/meu-teste.test.js` | Rodar um arquivo específico |
| `npx vitest` | Modo watch (re-executa ao salvar) |

## Resultado Atual

- **20 arquivos de teste**
- **310 testes**
- **Cobertura**: 99.06% statements, 100% branches (os únicos arquivos abaixo de 100% são gerados pelo Prisma em `generated/prisma/internal/class.ts`)

## Arquivos de Teste

### Serviços (app/services/)

| Arquivo | Testa | Testes |
|---|---|---|
| `AppointmentService.test.js` | `validateDate()`, `validateConflict()`, `validateAppointment()` | 16 |
| `CartService.test.js` | `addItem()`, `removeItem()`, `calculateTotal()` | 5 |
| `ProductService.test.js` | `validateProduct()` — nome, preço, descrição | 19 |
| `ServiceService.test.js` | `validateService()` — nome, preço, dias, horários | 22 |

### Rotas de API (app/api/)

| Arquivo | Rotas testadas | Testes |
|---|---|---|
| `productsRoute.test.js` | GET, POST, PUT, DELETE `/api/products` | 15 |
| `servicesRoute.test.js` | GET, POST, PUT, DELETE `/api/services` | 22 |
| `cartRoute.test.js` | GET, POST, DELETE `/api/cart` (in-memory) | 5 |
| `cartRoutePrisma.test.js` | GET, POST, PATCH, DELETE `/api/cart` (Prisma) | 24 |
| `ordersRoute.test.js` | GET, POST `/api/orders` (in-memory) | 3 |
| `ordersRoutePrisma.test.js` | GET, POST `/api/orders` (Prisma) | 9 |
| `appointmentsRoute.test.js` | GET, POST `/api/appointments` | 21 |
| `authRoute.test.js` | POST `/api/auth/login` | 9 |
| `logoutRoute.test.js` | POST `/api/auth/logout` | 1 |
| `meRoute.test.js` | GET `/api/auth/me` | 5 |
| `registerRoute.test.js` | POST `/api/auth/register` | 13 |
| `perfilRoute.test.js` | PATCH `/api/cliente/perfil` | 9 |

### Outros

| Arquivo | Testa | Testes |
|---|---|---|
| `middleware.test.js` | `proxy.js` (proteção de rotas, JWT, headers) | 14 |
| `components.test.jsx` | Componentes UI (Button, Card, Badge, Alert, Dialog, Input, Tabs, Popover, cn) | 38 |
| `lib.test.js` | `validation.js` (schemas Zod, CPF, CNPJ), `masks.js`, `error-handler.js`, `utils.js` | 58 |
| `prisma.test.js` | `prisma.js` (singleton, production guard) | 2 |

## Padrões de Teste

### In-Memory Store

Rotas de API que usam Prisma em produção têm uma flag `useMemoryStore` que ativa arrays em memória (`app/data/store.js`) durante os testes. Isso evita dependência de banco de dados.

```js
// Na rota:
const useMemoryStore = process.env.NODE_ENV === "test"
```

Os testes para o modo in-memory (ex: `cartRoute.test.js`) e para o modo Prisma (ex: `cartRoutePrisma.test.js`) são separados em arquivos diferentes.

### Mocking do Prisma

Para testar rotas que usam Prisma, o cliente é mockado com `vi.hoisted` + `vi.mock`:

```js
const mockPrisma = vi.hoisted(() => ({
  usuario: { findUnique: vi.fn(), findFirst: vi.fn() },
  carrinho: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
  itens: { create: vi.fn(), delete: vi.fn(), findFirst: vi.fn() },
}))
vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))
```

Os mocks são configurados em `beforeEach` com `mockImplementation` ou `mockResolvedValue` para cada cenário.

### Componentes

Componentes React são testados com `@testing-library/react` + `jsdom`. O padrão:

```js
import { render, screen, fireEvent } from "@testing-library/react"

it("renderiza com variante primary", () => {
  render(<Button variant="default">Clique</Button>)
  expect(screen.getByText("Clique")).toBeInTheDocument()
})
```

### Casos Especiais

- `lib.test.js` testa funções puras (validação, máscaras, utils) sem mocking
- `prisma.test.js` mocka as dependências do Prisma (`@prisma/adapter-pg` e o client gerado) para testar o singleton em ambiente de produção
- `middleware.test.js` testa o `proxy.js` simulando requests via `Request` do Node.js

## Cobertura por Diretório

| Diretório | Statements | Branches | Funcs |
|---|---|---|---|
| `app/api/` | 100% | 100% | 100% |
| `app/components/ui/` | 100% | 100% | 100% |
| `app/data/` | 100% | 100% | 100% |
| `app/lib/` | 100% | 100% | 100% |
| `app/services/` | 100% | 100% | 100% |
| `generated/prisma/` | 88% | 100% | 25% |
| `proxy.js` | 100% | 100% | 100% |
| **Total** | **99.06%** | **100%** | **96.8%** |

Os gaps em `generated/prisma/` são de código gerado automaticamente pelo Prisma (`class.ts`, com 45.45% statements), que não é coberto por testes por ser infraestrutura gerada.

