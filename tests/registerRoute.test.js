import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("Register Route", () => {
  let POST
  const mockPrisma = {
    endereco: { create: vi.fn() },
    usuario: { findFirst: vi.fn(), create: vi.fn() },
    funcionario: { findFirst: vi.fn(), create: vi.fn() },
    empresa: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  }

  beforeEach(async () => {
    vi.resetModules()

    vi.doMock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

    const mod = await import("../app/api/auth/register/route.js")
    POST = mod.POST
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── cliente ───────────────────────────────────────────────────────────────

  describe("cliente", () => {
    const clienteData = {
      type: "cliente",
      name: "João Silva",
      email: "joao@email.com",
      password: "123456",
      phone: "(11) 99999-9999",
      cpf: "529.982.247-25",
    }

    it("cria cliente com sucesso", async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 1 })
      mockPrisma.usuario.create.mockResolvedValue({ id: 1, name: "João Silva", email: "joao@email.com" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(clienteData),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.type).toBe("cliente")

      expect(mockPrisma.endereco.create).toHaveBeenCalled()
      expect(mockPrisma.usuario.create).toHaveBeenCalled()
    })

    it("rejeita cliente com email duplicado", async () => {
      mockPrisma.usuario.findFirst.mockResolvedValue({ id: 1, email: "joao@email.com" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(clienteData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("Email ou CPF já cadastrado")
    })

    it("rejeita cliente com campos faltando", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ type: "cliente", name: "João" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Todos os campos são obrigatórios")
    })
  })

  // ─── funcionario ───────────────────────────────────────────────────────────

  describe("funcionario", () => {
    const funcData = {
      type: "funcionario",
      name: "Maria Souza",
      email: "maria@empresa.com",
      password: "654321",
      phone: "(11) 99999-9999",
      cpf: "529.982.247-25",
    }

    it("cria funcionário sem empresaId", async () => {
      mockPrisma.funcionario.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 2 })
      mockPrisma.funcionario.create.mockResolvedValue({ id: 1, name: "Maria Souza", email: "maria@empresa.com" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(funcData),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.type).toBe("funcionario")
    })

    it("cria funcionário com empresaId válido", async () => {
      mockPrisma.funcionario.findFirst.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue({ id: 1, name: "Agiliza" })
      mockPrisma.endereco.create.mockResolvedValue({ id: 3 })
      mockPrisma.funcionario.create.mockResolvedValue({ id: 2, name: "Maria Souza" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaId: 1 }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
    })

    it("rejeita funcionário com campos faltando", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ type: "funcionario", name: "Maria" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Todos os campos são obrigatórios")
    })

    it("rejeita funcionário com empresaId inválido", async () => {
      mockPrisma.funcionario.findFirst.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaId: 999 }),
      })
      const res = await POST(req)
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe("Empresa não encontrada")
    })

    it("rejeita funcionário com email duplicado", async () => {
      mockPrisma.funcionario.findFirst.mockResolvedValue({ id: 1, email: "maria@empresa.com" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(funcData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
    })
  })

  // ─── empresa ───────────────────────────────────────────────────────────────

  describe("empresa", () => {
    const empresaData = {
      type: "empresa",
      name: "Agiliza",
      razaoSocial: "Agiliza Ltda",
      cnpj: "11.222.333/0001-81",
      email: "contato@agiliza.com",
      phone: "(11) 99999-9999",
      password: "123456",
    }

    it("cria empresa com sucesso", async () => {
      mockPrisma.empresa.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 4 })
      mockPrisma.empresa.create.mockResolvedValue({ id: 1, name: "Agiliza", email: "contato@agiliza.com" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(empresaData),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.type).toBe("empresa")
    })

    it("rejeita empresa com email duplicado", async () => {
      mockPrisma.empresa.findFirst.mockResolvedValue({ id: 1, email: "contato@agiliza.com" })

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(empresaData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
    })

    it("rejeita empresa com campos faltando", async () => {
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ type: "empresa", name: "Agiliza" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })

  // ─── geral ─────────────────────────────────────────────────────────────────

  it("rejeita tipo inválido", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ type: "admin" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Tipo de cadastro inválido")
  })

  it("rejeita JSON inválido", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: "invalid-json",
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
