import { beforeEach, describe, expect, it, vi } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  usuario: { findUnique: vi.fn() },
  funcionario: { findUnique: vi.fn() },
}))

vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

const mockTokenValue = vi.hoisted(() => ({ current: null }))

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(() => (mockTokenValue.current ? { value: mockTokenValue.current } : undefined)),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}))

const mockJwt = vi.hoisted(() => ({
  default: { verify: vi.fn() },
}))

vi.mock("jsonwebtoken", () => mockJwt)

describe("Me Route", () => {
  let GET

  beforeEach(async () => {
    vi.clearAllMocks()
    mockTokenValue.current = null

    const mod = await import("../app/api/auth/me/route.js")
    GET = mod.GET
  })

  it("retorna 401 sem cookie", async () => {
    const res = await GET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.user).toBeNull()
  })

  it("retorna 401 com token inválido", async () => {
    mockTokenValue.current = "invalid-token"
    mockJwt.default.verify.mockImplementation(() => { throw new Error("jwt malformed") })

    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("retorna dados do cliente autenticado", async () => {
    mockTokenValue.current = "valid-token"
    mockJwt.default.verify.mockReturnValue({
      sub: 1, email: "cliente@email.com", name: "Cliente", role: "cliente",
    })
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, name: "Cliente", email: "cliente@email.com", phone: "(11) 99999-9999",
      endereco: { street: "Rua A", city: "São Paulo", state: "SP", zipCode: "01001-000", country: "Brasil" },
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.email).toBe("cliente@email.com")
    expect(body.user.endereco.city).toBe("São Paulo")
  })

  it("retorna dados do funcionário autenticado", async () => {
    mockTokenValue.current = "func-token"
    mockJwt.default.verify.mockReturnValue({
      sub: 2, email: "func@empresa.com", name: "Func", role: "funcionario", empresaId: 1,
    })
    mockPrisma.funcionario.findUnique.mockResolvedValue({
      id: 2, name: "Func", email: "func@empresa.com", phone: "(11) 99999-9999",
      endereco: { street: "Rua B", city: "Campinas", state: "SP", zipCode: "13000-000", country: "Brasil" },
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.role).toBe("funcionario")
    expect(body.user.endereco.street).toBe("Rua B")
  })

  it("retorna payload quando usuário não existe no banco", async () => {
    mockTokenValue.current = "ghost-token"
    mockJwt.default.verify.mockReturnValue({
      sub: 999, email: "ghost@email.com", name: "Ghost", role: "cliente",
    })
    mockPrisma.usuario.findUnique.mockResolvedValue(null)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.email).toBe("ghost@email.com")
    expect(body.user.endereco).toBeUndefined()
  })
})
