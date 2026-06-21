import { beforeEach, describe, expect, it, vi } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  funcionario: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
}))

vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

const mockJwt = vi.hoisted(() => ({
  default: { verify: vi.fn() },
}))

vi.mock("jsonwebtoken", () => mockJwt)

function makeReq({ body, token, role }) {
  const req = {
    cookies: {
      get: (name) => (name === "agiliza_token" && token ? { value: token } : undefined),
    },
  }
  if (body !== undefined) {
    req.json = async () => body
  }
  return req
}

describe("Empresa Funcionarios Route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("GET", () => {
    it("retorna 403 sem token", async () => {
      const { GET } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await GET(makeReq({ token: null }))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toBe("Não autorizado")
    })

    it("retorna 403 com role inválida", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "funcionario" })
      const { GET } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await GET(makeReq({ token: "token-func" }))
      expect(res.status).toBe(403)
    })

    it("retorna 403 com token inválido (jwt.verify lança erro)", async () => {
      mockJwt.default.verify.mockImplementation(() => { throw new Error("jwt malformed") })
      const { GET } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await GET(makeReq({ token: "token-invalido" }))
      expect(res.status).toBe(403)
    })

    it("retorna lista de funcionários", async () => {
      const funcionarios = [
        { id: 1, name: "João", email: "joao@e.com", phone: "111", active: true },
        { id: 2, name: "Maria", email: "maria@e.com", phone: "222", active: true },
      ]
      mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
      mockPrisma.funcionario.findMany.mockResolvedValue(funcionarios)

      const { GET } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await GET(makeReq({ token: "token-valido" }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual(funcionarios)
      expect(mockPrisma.funcionario.findMany).toHaveBeenCalledWith({
        where: { empresaId: 5 },
        select: { id: true, name: true, email: true, phone: true, active: true },
      })
    })

    it("retorna 500 em caso de erro do Prisma", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      mockPrisma.funcionario.findMany.mockRejectedValue(new Error("DB error"))

      const { GET } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await GET(makeReq({ token: "token" }))
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe("DB error")
    })
  })

  describe("POST", () => {
    it("retorna 403 sem token", async () => {
      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(makeReq({ body: { email: "func@e.com" }, token: null }))
      expect(res.status).toBe(403)
    })

    it("retorna 400 se email não for enviado", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(makeReq({ body: {}, token: "token" }))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("Email é obrigatório")
    })

    it("retorna 404 se funcionário não existir", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)

      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(makeReq({ body: { email: "inexistente@e.com" }, token: "token" }))
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe("Funcionário não encontrado")
    })

    it("retorna 409 se já vinculado à mesma empresa", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 10, email: "func@e.com", empresaId: 1 })

      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(makeReq({ body: { email: "func@e.com" }, token: "token" }))
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("Funcionário já vinculado à sua empresa")
    })

    it("retorna 409 se já vinculado a outra empresa", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "2", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 10, email: "func@e.com", empresaId: 99 })

      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(makeReq({ body: { email: "func@e.com" }, token: "token" }))
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toBe("Funcionário já vinculado a outra empresa")
    })

    it("vincula funcionário com sucesso", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 10, name: "Carlos", email: "carlos@e.com", empresaId: null })
      mockPrisma.funcionario.update.mockResolvedValue({})

      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(makeReq({ body: { email: "carlos@e.com" }, token: "token" }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.name).toBe("Carlos")
      expect(mockPrisma.funcionario.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { empresaId: 5 },
      })
    })

    it("retorna 500 para JSON inválido", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      const req = { cookies: { get: () => ({ value: "token" }) }, json: async () => { throw new Error("Unexpected end of JSON input") } }

      const { POST } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await POST(req)
      expect(res.status).toBe(500)
    })
  })

  describe("DELETE", () => {
    it("retorna 403 sem token", async () => {
      const { DELETE } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await DELETE(makeReq({ body: { id: 1 }, token: null }))
      expect(res.status).toBe(403)
    })

    it("retorna 400 se id não for enviado", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      const { DELETE } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await DELETE(makeReq({ body: {}, token: "token" }))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe("ID é obrigatório")
    })

    it("retorna 404 se funcionário não existir", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue(null)

      const { DELETE } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await DELETE(makeReq({ body: { id: 999 }, token: "token" }))
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe("Funcionário não encontrado")
    })

    it("retorna 403 se funcionário não pertence à empresa", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 10, empresaId: 99 })

      const { DELETE } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await DELETE(makeReq({ body: { id: 10 }, token: "token" }))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toBe("Funcionário não pertence à sua empresa")
    })

    it("desvincula funcionário com sucesso", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 10, empresaId: 5 })
      mockPrisma.funcionario.update.mockResolvedValue({})

      const { DELETE } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await DELETE(makeReq({ body: { id: 10 }, token: "token" }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(mockPrisma.funcionario.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { empresaId: null },
      })
    })

    it("retorna 500 para erro do Prisma no DELETE", async () => {
      mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
      mockPrisma.funcionario.findUnique.mockRejectedValue(new Error("DB error"))

      const { DELETE } = await import("../app/api/empresa/funcionarios/route.js")
      const res = await DELETE(makeReq({ body: { id: 1 }, token: "token" }))
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe("DB error")
    })
  })
})
