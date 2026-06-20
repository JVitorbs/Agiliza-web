import { beforeEach, describe, expect, it, vi } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  usuario: { findUnique: vi.fn(), update: vi.fn() },
  endereco: { update: vi.fn() },
}))

vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

describe("Perfil Route", () => {
  let PATCH

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import("../app/api/cliente/perfil/route.js")
    PATCH = mod.PATCH
  })

  // ─── profile fields ──────────────────────────────────────────────────────

  it("atualiza nome e phone", async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({ id: 1, name: "Old", email: "c@c.com", phone: null })
    mockPrisma.usuario.update.mockResolvedValue({ id: 1, name: "New Name", email: "c@c.com", phone: "(11) 99999-9999" })

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "x-user-id": "1" },
      body: JSON.stringify({ name: "New Name", phone: "(11) 99999-9999" }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.name).toBe("New Name")
    expect(body.user.phone).toBe("(11) 99999-9999")
  })

  it("atualiza apenas name", async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({ id: 1, name: "Old", email: "c@c.com", phone: null })
    mockPrisma.usuario.update.mockResolvedValue({ id: 1, name: "Only Name", email: "c@c.com", phone: null })

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "x-user-id": "1" },
      body: JSON.stringify({ name: "Only Name" }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.name).toBe("Only Name")
  })

  it("retorna 404 usuario não encontrado", async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "x-user-id": "999" },
      body: JSON.stringify({ name: "Ghost" }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe("Usuário não encontrado")
  })

  // ─── address fields ──────────────────────────────────────────────────────

  it("atualiza endereco", async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({ enderecoId: 5 })
    mockPrisma.endereco.update.mockResolvedValue({
      id: 5, street: "Rua X", city: "São Paulo", state: "SP", zipCode: "01001-000", country: "Brasil",
    })

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "x-user-id": "1" },
      body: JSON.stringify({ street: "Rua X", city: "São Paulo", state: "SP", zipCode: "01001-000", country: "Brasil" }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.endereco.street).toBe("Rua X")
  })

  it("atualiza apenas CEP", async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({ enderecoId: 5 })
    mockPrisma.endereco.update.mockResolvedValue({
      id: 5, street: "Rua Y", city: "Campinas", state: "SP", zipCode: "13000-000", country: "Brasil",
    })

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "x-user-id": "1" },
      body: JSON.stringify({ zipCode: "13000-000" }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect(mockPrisma.endereco.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5 },
        data: { zipCode: "13000-000" },
      })
    )
  })

  // ─── sem campos ──────────────────────────────────────────────────────────

  it("retorna 400 sem campos para atualizar", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "x-user-id": "1" },
      body: JSON.stringify({}),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Nenhum campo para atualizar")
  })

  // ─── sem userId ──────────────────────────────────────────────────────────

  it("retorna 401 sem x-user-id", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ name: "X" }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Não autorizado")
  })
})
