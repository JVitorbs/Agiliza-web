# <img src="public/img/logo_simb_azul.png" alt="Logo do Projeto" width="75"/> Agiliza-web

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Como clonar ou baixar](#como-clonar-ou-baixar)  
- [Estrutura do Projeto](#estrutura-do-projeto)  
- [Licença](#licença)  

## Sobre o Projeto

### Título
Agiliza

### Descrição
SoftWare Web para unificação de serviços e vendas

### Componentes
- Hugo Henrique De Vasconcelos Figueiredo 
- João Vitor Batista Silva
- Luciano de Medeiros Filho 

## Como clonar ou baixar

Você pode obter este repositório de três formas:

### Clonar via HTTPS

```bash
git clone https://github.com/JVitorbs/Agiliza-web.git
```

Isso criará uma cópia local do repositório em sua máquina.

### Clonar via SSH

Se você já configurou sua chave SSH no GitHub, pode clonar usando:

```bash
git clone git@github.com:JVitorbs/Agiliza-web.git
```

Isso criará uma cópia local do repositório em sua máquina.

### Baixar como ZIP

1. Acesse a página do repositório no GitHub:
   [https://github.com/JVitorbs/Agiliza-web#](https://github.com/JVitorbs/Agiliza-web#)
2. Clique no botão **Code** (verde).
3. Selecione **Download ZIP**.
4. Extraia o arquivo ZIP para o local desejado em seu computador.


## Estrutura do Projeto

```
Agiliza-web/
├── app/
│   ├── api/              # API routes (backend)
│   │   ├── auth/         #   login, logout, register, me
│   │   ├── appointments/ #   agendamentos (GET, POST)
│   │   ├── cart/         #   carrinho (GET, POST, PATCH, DELETE)
│   │   ├── cliente/      #   perfil (PATCH)
│   │   ├── empresa/      #   dashboard, funcionarios
│   │   ├── orders/       #   pedidos (GET, POST)
│   │   ├── products/     #   produtos (GET, POST, PUT, DELETE)
│   │   └── services/     #   serviços (GET, POST, PUT, DELETE)
│   ├── cliente/          # Páginas do cliente
│   │   ├── agendamentos/
│   │   ├── carrinho/
│   │   ├── configuracoes/
│   │   ├── pedidos/
│   │   ├── produtos/
│   │   └── servicos/
│   ├── components/       # Componentes React
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Logo.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── ui/           #   shadcn/ui (button, card, badge, input, dialog, etc.)
│   ├── data/             # Store in-memory para testes
│   ├── empresa/          # Páginas da empresa
│   │   ├── dashboard/
│   │   └── funcionarios/
│   ├── funcionario/      # Páginas do funcionário
│   │   ├── produtos/
│   │   └── servicos/
│   ├── lib/              # Utilitários (prisma, validation, masks, utils)
│   ├── services/         # Camada de serviço (validações e regras de negócio)
│   ├── globals.css       # Estilos globais + tema Tailwind
│   ├── layout.js         # Layout raiz com Navbar + Footer
│   ├── page.js           # Landing page
│   ├── appointments/
│   ├── cart/
│   ├── login/
│   ├── orders/
│   ├── products/
│   ├── register/
│   └── services/
├── docs/                 # Documentação do projeto
├── generated/prisma/     # Cliente Prisma gerado (auto-generated)
├── prisma/
│   ├── migrations/       # Histórico de migrations
│   ├── schema.prisma     # Schema do banco de dados
│   └── seed.ts           # Seed de dados
├── public/img/           # Imagens estáticas (logotipos)
├── tests/                # Testes automatizados (Vitest)
├── .github/workflows/    # CI (GitHub Actions)
├── proxy.js              # Middleware de autenticação (Edge Runtime)
├── next.config.mjs
├── vitest.config.js
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

- `app/`: aplicação Next.js (App Router). `app/api/` contém as rotas de backend; os demais diretórios são páginas do frontend.
- `prisma/`: schema do banco PostgreSQL + migrations + seed.
- `generated/prisma/`: cliente Prisma gerado automaticamente (`npx prisma generate`).
- `tests/`: testes unitários com Vitest (22 arquivos, cobrindo rotas, serviços e componentes).
- `proxy.js`: middleware de autenticação que roda no Edge Runtime do Next.js, verifica JWT e protege rotas.
- `docs/`: documentação do projeto (arquitetura, tecnologias, testes, histórias de usuário).

## Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo `LICENSE` para mais detalhes.
