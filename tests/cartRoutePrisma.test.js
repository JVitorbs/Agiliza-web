import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  carrinho: { findFirst: vi.fn(), create: vi.fn() },
  itens: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))

describe("Cart Route — Prisma path", () => {
  let GET, POST, PATCH, DELETE

  function headers(overrides = {}) {
    return {
      "x-user-id": "1",
      "x-user-role": "cliente",
      "Content-Type": "application/json",
      ...overrides,
    }
  }

  function mockCart(itens = []) {
    return { id: 1, usuarioId: 1, itens, createdAt: new Date() }
  }

  function mockItem(overrides = {}) {
    return {
      id: 10,
      carrinhoId: 1,
      produtoId: 1,
      servicoId: null,
      quantity: 2,
      produto: { id: 1, name: "Produto", price: 29.9 },
      servico: null,
      ...overrides,
    }
  }

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv("NODE_ENV", "development")

    vi.doMock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

    const mod = await import("../app/api/cart/route.js")
    GET = mod.GET
    POST = mod.POST
    PATCH = mod.PATCH
    DELETE = mod.DELETE
  })

  // ─── GET ─────────────────────────────────────────────────────────────────

  it("GET retorna 403 para funcionario", async () => {
    const req = new Request("http://localhost", { headers: headers({ "x-user-role": "funcionario" }) })
    const res = await GET(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe("Apenas clientes podem usar o carrinho")
  })

  it("GET retorna 403 para empresa", async () => {
    const req = new Request("http://localhost", { headers: headers({ "x-user-role": "empresa" }) })
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it("GET retorna array vazio sem userId", async () => {
    const req = new Request("http://localhost", { headers: headers({ "x-user-id": "" }) })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it("GET cria carrinho novo se não existir", async () => {
    mockPrisma.carrinho.findFirst.mockResolvedValue(null)
    mockPrisma.carrinho.create.mockResolvedValue(mockCart([]))

    const req = new Request("http://localhost", { headers: headers() })
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(mockPrisma.carrinho.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { usuarioId: 1 } })
    )
  })

  it("GET retorna itens formatados", async () => {
    mockPrisma.carrinho.findFirst.mockResolvedValue(mockCart([mockItem()]))

    const req = new Request("http://localhost", { headers: headers() })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].name).toBe("Produto")
    expect(body[0].price).toBe(29.9)
    expect(body[0].quantity).toBe(2)
  })

  it("GET trata erro Prisma", async () => {
    mockPrisma.carrinho.findFirst.mockRejectedValue(new Error("DB error"))

    const req = new Request("http://localhost", { headers: headers() })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  // ─── POST ────────────────────────────────────────────────────────────────

  it("POST retorna 403 para funcionario", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers({ "x-user-role": "funcionario" }),
      body: JSON.stringify({ produtoId: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it("POST retorna 400 sem produtoId/servicoId", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Produto ou serviço obrigatório")
  })

  it("POST adiciona novo produto ao carrinho", async () => {
    mockPrisma.carrinho.findFirst
      .mockResolvedValueOnce(mockCart([]))  // getOrCreateCart — find
      .mockResolvedValueOnce(mockCart([     // getOrCreateCart — create (already done)
        mockItem({ id: 20, produtoId: 2, quantity: 1, produto: { id: 2, name: "Novo", price: 15 } }),
      ]))
    mockPrisma.carrinho.create.mockResolvedValue(mockCart([]))
    mockPrisma.itens.create.mockResolvedValue({})

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ produtoId: 2, quantity: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockPrisma.itens.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ produtoId: 2, quantity: 1 }),
      })
    )
  })

  it("POST adiciona novo serviço ao carrinho", async () => {
    mockPrisma.carrinho.findFirst
      .mockResolvedValueOnce(mockCart([]))
      .mockResolvedValueOnce(mockCart([
        mockItem({ id: 21, servicoId: 3, produtoId: null, quantity: 1, servico: { id: 3, name: "Serviço", price: 100 } }),
      ]))
    mockPrisma.carrinho.create.mockResolvedValue(mockCart([]))
    mockPrisma.itens.create.mockResolvedValue({})

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ servicoId: 3, quantity: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it("POST incrementa quantidade para item existente", async () => {
    mockPrisma.carrinho.findFirst
      .mockResolvedValueOnce(mockCart([mockItem()]))   // getOrCreateCart — carrinho com item
      .mockResolvedValueOnce(mockCart([mockItem({ quantity: 3 })])) // after update
    mockPrisma.itens.update.mockResolvedValue({})

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ produtoId: 1, quantity: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockPrisma.itens.update).toHaveBeenCalled()
  })

  // ─── DELETE ──────────────────────────────────────────────────────────────

  it("DELETE retorna erro para item inexistente", async () => {
    mockPrisma.itens.findUnique.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ id: 999 }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Item não encontrado")
  })

  it("DELETE retorna erro para acesso negado", async () => {
    mockPrisma.itens.findUnique.mockResolvedValue({ id: 1, carrinhoId: 5 })
    mockPrisma.carrinho.findFirst.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ id: 1 }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Acesso negado")
  })

  it("DELETE remove item com sucesso", async () => {
    mockPrisma.itens.findUnique.mockResolvedValue({ id: 1, carrinhoId: 1 })
    mockPrisma.carrinho.findFirst.mockResolvedValue({ id: 1, usuarioId: 1 })
    mockPrisma.itens.delete.mockResolvedValue({})

    const req = new Request("http://localhost", {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ id: 1 }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  // ─── PATCH ────────────────────────────────────────────────────────────────

  it("PATCH retorna 403 para funcionario", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: headers({ "x-user-role": "funcionario" }),
      body: JSON.stringify({ id: 1, quantity: 3 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(403)
  })

  it("PATCH retorna 400 sem id ou quantity", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({}),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it("PATCH retorna 400 para quantity menor que 1", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ id: 1, quantity: 0 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it("PATCH retorna 404 para item inexistente", async () => {
    mockPrisma.itens.findUnique.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ id: 999, quantity: 3 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(404)
  })

  it("PATCH retorna 403 para acesso negado", async () => {
    mockPrisma.itens.findUnique.mockResolvedValue({ id: 1, carrinhoId: 5 })
    mockPrisma.carrinho.findFirst.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ id: 1, quantity: 3 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(403)
  })

  it("PATCH atualiza quantidade com sucesso", async () => {
    mockPrisma.itens.findUnique.mockResolvedValue({ id: 1, carrinhoId: 1 })
    mockPrisma.carrinho.findFirst.mockResolvedValue({ id: 1, usuarioId: 1 })
    mockPrisma.itens.update.mockResolvedValue({})

    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ id: 1, quantity: 5 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect(mockPrisma.itens.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { quantity: 5 } })
    )
  })
})
