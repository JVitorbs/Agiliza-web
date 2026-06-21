import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  endereco: { create: vi.fn() },
  usuario: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  funcionario: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  empresa: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
}))

vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

describe("Register Route", () => {
  beforeEach(() => {
    mockPrisma.endereco.create.mockReset()
    mockPrisma.usuario.findFirst.mockReset()
    mockPrisma.usuario.findUnique.mockReset()
    mockPrisma.usuario.create.mockReset()
    mockPrisma.funcionario.findFirst.mockReset()
    mockPrisma.funcionario.findUnique.mockReset()
    mockPrisma.funcionario.create.mockReset()
    mockPrisma.empresa.findFirst.mockReset()
    mockPrisma.empresa.findUnique.mockReset()
    mockPrisma.empresa.create.mockReset()
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
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)
      mockPrisma.usuario.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 1 })
      mockPrisma.usuario.create.mockResolvedValue({ id: 1, name: "João Silva", email: "joao@email.com" })

      const { POST } = await import("../app/api/auth/register/route.js")
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
      mockPrisma.usuario.findUnique.mockResolvedValue({ id: 1, email: "joao@email.com" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(clienteData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("Email já cadastrado")
    })

    it("rejeita cliente com campos faltando", async () => {
      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ type: "cliente", name: "João" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Todos os campos são obrigatórios")
    })

    it("rejeita cliente com CPF duplicado", async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)
      mockPrisma.usuario.findFirst.mockResolvedValue({ id: 2, cpf: "529.982.247-25" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(clienteData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("Email ou CPF já cadastrado")
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
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 2 })
      mockPrisma.funcionario.create.mockResolvedValue({ id: 1, name: "Maria Souza", email: "maria@empresa.com" })

      const { POST } = await import("../app/api/auth/register/route.js")
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
      let callCount = 0
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockImplementation(() => {
        callCount++
        if (callCount === 1) return Promise.resolve(null)
        return Promise.resolve({ id: 1, name: "Agiliza" })
      })
      mockPrisma.endereco.create.mockResolvedValue({ id: 3 })
      mockPrisma.funcionario.create.mockResolvedValue({ id: 2, name: "Maria Souza" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaId: 1 }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
    })

    it("rejeita funcionário com campos faltando", async () => {
      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ type: "funcionario", name: "Maria" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Todos os campos são obrigatórios")
    })

    it("rejeita funcionário com CPF duplicado", async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findFirst.mockResolvedValue({ id: 2, cpf: "529.982.247-25" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(funcData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("CPF já cadastrado")
    })

    it("rejeita funcionário com empresaId inválido", async () => {
      let callCount = 0
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockImplementation(() => {
        callCount++
        if (callCount === 1) return Promise.resolve(null)
        return Promise.resolve(null)
      })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaId: 999 }),
      })
      const res = await POST(req)
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe("Empresa não encontrada")
    })

    it("cria funcionário com empresaEmail válido", async () => {
      let callCount = 0
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockImplementation(() => {
        callCount++
        if (callCount === 1) return Promise.resolve(null)
        if (callCount === 2) return Promise.resolve({ id: 5, email: "empresa@agiliza.com" })
        return Promise.resolve({ id: 5 })
      })
      mockPrisma.funcionario.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 10 })
      mockPrisma.funcionario.create.mockResolvedValue({ id: 3, name: "Maria Souza" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaEmail: "empresa@agiliza.com" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      expect(mockPrisma.funcionario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ empresaId: 5 }),
        })
      )
    })

    it("rejeita funcionário com empresaEmail inválido", async () => {
      let callCount = 0
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockImplementation(() => {
        callCount++
        if (callCount === 1) return Promise.resolve(null)
        return Promise.resolve(null)
      })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaEmail: "inexistente@agiliza.com" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe("Empresa não encontrada com esse email")
    })

    it("ignora empresaEmail quando empresaId é fornecido", async () => {
      let callCount = 0
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockImplementation(() => {
        callCount++
        if (callCount === 1) return Promise.resolve(null)
        return Promise.resolve({ id: 1 })
      })
      mockPrisma.funcionario.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 11 })
      mockPrisma.funcionario.create.mockResolvedValue({ id: 4, name: "Maria Souza" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ ...funcData, empresaId: 1, empresaEmail: "outro@email.com" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      expect(mockPrisma.funcionario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ empresaId: 1 }),
        })
      )
    })

    it("rejeita funcionário com email duplicado", async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 1, email: "maria@empresa.com" })

      const { POST } = await import("../app/api/auth/register/route.js")
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
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findFirst.mockResolvedValue(null)
      mockPrisma.endereco.create.mockResolvedValue({ id: 4 })
      mockPrisma.empresa.create.mockResolvedValue({ id: 1, name: "Agiliza", email: "contato@agiliza.com" })

      const { POST } = await import("../app/api/auth/register/route.js")
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
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue({ id: 1, email: "contato@agiliza.com" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(empresaData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
    })

    it("rejeita empresa com campos faltando", async () => {
      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ type: "empresa", name: "Agiliza" }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it("rejeita empresa com CNPJ duplicado", async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null)
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findUnique.mockResolvedValue(null)
      mockPrisma.empresa.findFirst.mockResolvedValue({ id: 2, cnpj: "11.222.333/0001-81" })

      const { POST } = await import("../app/api/auth/register/route.js")
      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(empresaData),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("CNPJ já cadastrado")
    })
  })

  // ─── geral ─────────────────────────────────────────────────────────────────

  it("rejeita tipo inválido", async () => {
    const { POST } = await import("../app/api/auth/register/route.js")
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
    const { POST } = await import("../app/api/auth/register/route.js")
    const req = new Request("http://localhost", {
      method: "POST",
      body: "invalid-json",
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
