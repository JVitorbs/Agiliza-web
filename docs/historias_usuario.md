# Histórias de Usuário - Agiliza

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Diagrama de Funcionalidades](#diagrama-de-funcionalidades)
- [Histórias Detalhadas](#histórias-detalhadas)
  - [US-001: Comprar Produtos](#us-001-comprar-produtos)
  - [US-002: Agendar Serviços](#us-002-agendar-serviços)
  - [US-003: Cadastrar Produtos](#us-003-cadastrar-produtos)

---

## 🎯 Visão Geral

Este documento contém as histórias de usuário do sistema Agiliza, descrevendo as funcionalidades principais da plataforma e seus critérios de aceitação.

### Resumo das Histórias

| ID | Título | Ator | Prioridade | Estimativa |
|---|---|---|---|---|
| US-001 | Comprar Produtos | Usuário | Alta | 8 pts |
| US-002 | Agendar Serviços | Usuário | Alta | 5 pts |
| US-003 | Cadastrar Produtos | Funcionário | Alta | 3 pts |

---

## 📊 Diagrama de Funcionalidades

```mermaid
graph TB
    subgraph Usuário["👤 Usuário"]
        US1["🛍️ Comprar Produtos"]
        US2["📅 Agendar Serviços"]
    end
    
    subgraph Funcionário["👨‍💼 Funcionário"]
        US3["📦 Cadastrar Produtos"]
    end
    
    DB["💾 Base de Dados"]
    
    US1 --> DB
    US2 --> DB
    US3 --> DB
    
    style US1 fill:#e1f5ff
    style US2 fill:#e1f5ff
    style US3 fill:#fff3e0
```

---

## 📖 Histórias Detalhadas

### US-001: Comprar Produtos

**Tipo de Ator:** Usuário da Plataforma

**Descrição:** Como usuário da plataforma, eu quero buscar e comprar produtos, para que eu possa adquiri-los de forma prática online.

**Metadados:**
- **Prioridade:** Alta
- **Estimativa:** 8 pontos

**Critérios de Aceitação:**

- [ ] O usuário deve poder buscar produtos por nome ou categoria
- [ ] O usuário deve poder adicionar produtos ao carrinho
- [ ] O usuário deve poder finalizar a compra
- [ ] O sistema deve registrar o pedido no histórico do usuário e gerar uma nota fiscal

**Fluxo de Compra:**

```mermaid
sequenceDiagram
    actor U as Usuário
    participant SYS as Sistema
    participant DB as Base de Dados
    
    U->>SYS: Busca produto
    SYS->>DB: Consulta produtos
    DB-->>SYS: Retorna resultados
    SYS-->>U: Exibe produtos
    U->>SYS: Adiciona ao carrinho
    U->>SYS: Finaliza compra
    SYS->>DB: Registra pedido
    SYS->>DB: Gera nota fiscal
    DB-->>SYS: Confirmação
    SYS-->>U: Exibe confirmação
```

---

### US-002: Agendar Serviços

**Tipo de Ator:** Usuário da Plataforma

**Descrição:** Como usuário da plataforma, eu quero agendar serviços, para que eu possa escolher horários disponíveis de acordo com minha necessidade.

**Metadados:**
- **Prioridade:** Alta
- **Estimativa:** 5 pontos

**Critérios de Aceitação:**

- [ ] O usuário deve visualizar os horários disponíveis
- [ ] O usuário deve poder selecionar data e hora
- [ ] O sistema deve confirmar o agendamento
- [ ] O agendamento deve aparecer no histórico do usuário

**Fluxo de Agendamento:**

```mermaid
flowchart LR
    A["Visualizar Horários"] --> B["Selecionar Data e Hora"]
    B --> C["Confirmar Agendamento"]
    C --> D["Adicionar ao Histórico"]
    D --> E["✅ Sucesso"]
```

---

### US-003: Cadastrar Produtos

**Tipo de Ator:** Funcionário

**Descrição:** Como funcionário, eu quero cadastrar produtos loja em que eu trabalho, para que eles fiquem disponíveis para venda.

**Metadados:**
- **Prioridade:** Alta
- **Estimativa:** 3 pontos

**Critérios de Aceitação:**

- [ ] O funcionário deve informar nome, preço e descrição do produto
- [ ] O produto deve ficar visível para os usuários
- [ ] O funcionário deve poder editar produtos cadastrados
- [ ] O funcionário deve poder remover produtos

**Fluxo de Gerenciamento de Produtos:**

```mermaid
graph TB
    A["📝 Informar Dados<br/>Nome, Preço, Descrição"]
    B["✅ Cadastrar Produto"]
    C["👁️ Produto Visível"]
    D["✏️ Editar Produto"]
    E["🗑️ Remover Produto"]
    F["💾 Atualizar Dados"]
    
    A --> B --> C
    C --> D --> F
    C --> E --> F
    
    style A fill:#fff3e0
    style B fill:#e8f5e9
    style C fill:#e8f5e9
    style D fill:#fff3e0
    style E fill:#ffebee
    style F fill:#e8f5e9
```

---

## 📈 Roadmap Resumido

```mermaid
gantt
    title Estimativa de Desenvolvimento
    dateFormat YYYY-MM-DD
    
    US-003 Cadastrar Produtos :us3, 2026-05-10, 3d
    US-002 Agendar Serviços :us2, after us3, 3d
    US-001 Comprar Produtos :us1, after us2, 3d
```

---

**Última Atualização:** 27 de abril de 2026