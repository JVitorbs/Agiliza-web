import { beforeEach, describe, expect, it, vi } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  funcionario: { findUnique: vi.fn() },
  usuario: { findUnique: vi.fn() },
}))

vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

const mockCookieStore = vi.hoisted(() => ({
  set: vi.fn(),
  delete: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}))

const mockJwt = vi.hoisted(() => ({
  default: { sign: vi.fn() },
}))

vi.mock("jsonwebtoken", () => mockJwt)

const mockBcrypt = vi.hoisted(() => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}))

vi.mock("bcryptjs", () => mockBcrypt)

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve realizar login como funcionário", async () => {
    mockPrisma.funcionario.findUnique.mockResolvedValue({
      id: 1,
      name: "Funcionário",
      email: "funcionario@agiliza.com",
      password: "hashed-password",
      active: true,
    })
    mockPrisma.usuario.findUnique.mockResolvedValue(null)
    mockBcrypt.default.compare.mockResolvedValue(true)
    mockJwt.default.sign.mockReturnValue("fake-token")

    const { POST } = await import("../app/api/auth/login/route.js")

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "funcionario@agiliza.com", password: "123456" }),
      })
    )

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.role).toBe("funcionario")
    expect(data.user.email).toBe("funcionario@agiliza.com")
    expect(mockJwt.default.sign).toHaveBeenCalled()
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "agiliza_token",
      "fake-token",
      expect.objectContaining({ httpOnly: true })
    )
  })

  it("deve realizar login como cliente", async () => {
    mockPrisma.funcionario.findUnique.mockResolvedValue(null)
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 2,
      name: "Cliente",
      email: "cliente@agiliza.com",
      password: "hashed-password",
      active: true,
    })
    mockBcrypt.default.compare.mockResolvedValue(true)
    mockJwt.default.sign.mockReturnValue("fake-token")

    const { POST } = await import("../app/api/auth/login/route.js")

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "cliente@agiliza.com", password: "123456" }),
      })
    )

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.role).toBe("cliente")
  })

  it("deve rejeitar credenciais inválidas", async () => {
    mockPrisma.funcionario.findUnique.mockResolvedValue(null)
    mockPrisma.usuario.findUnique.mockResolvedValue(null)

    const { POST } = await import("../app/api/auth/login/route.js")

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "inexistente@test.com", password: "qualquer" }),
      })
    )

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  it("deve rejeitar senha incorreta", async () => {
    mockPrisma.funcionario.findUnique.mockResolvedValue({
      id: 1,
      name: "Funcionário",
      email: "funcionario@agiliza.com",
      password: "hashed-password",
      active: true,
    })
    mockPrisma.usuario.findUnique.mockResolvedValue(null)
    mockBcrypt.default.compare.mockResolvedValue(false)

    const { POST } = await import("../app/api/auth/login/route.js")

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "funcionario@agiliza.com", password: "senhaErrada" }),
      })
    )

    expect(response.status).toBe(401)
  })

  it("deve validar campos obrigatórios", async () => {
    const { POST } = await import("../app/api/auth/login/route.js")

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "", password: "" }),
      })
    )

    expect(response.status).toBe(400)
  })
})
