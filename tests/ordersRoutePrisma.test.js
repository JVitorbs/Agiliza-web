import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  carrinho: { findFirst: vi.fn() },
  pedido: { findMany: vi.fn(), create: vi.fn() },
  itens: { deleteMany: vi.fn() },
}))

describe("Orders Route — Prisma path", () => {
  let GET, POST

  function headers(overrides = {}) {
    return {
      "x-user-id": "1",
      "Content-Type": "application/json",
      ...overrides,
    }
  }

  function mockCartItem(overrides = {}) {
    return {
      id: 1,
      carrinhoId: 1,
      produtoId: 1,
      servicoId: null,
      name: "Produto",
      quantity: 2,
      unitPrice: 29.9,
      subtotal: 59.8,
      produto: { id: 1, name: "Produto", price: 29.9 },
      servico: null,
      ...overrides,
    }
  }

  function mockCart(itens = []) {
    return { id: 1, usuarioId: 1, itens }
  }

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv("NODE_ENV", "development")

    vi.doMock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

    const mod = await import("../app/api/orders/route.js")
    GET = mod.GET
    POST = mod.POST
  })

  // ─── GET ─────────────────────────────────────────────────────────────────

  it("GET retorna array vazio sem userId", async () => {
    const req = new Request("http://localhost", { headers: headers({ "x-user-id": "" }) })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it("GET retorna array vazio quando não há pedidos", async () => {
    mockPrisma.pedido.findMany.mockResolvedValue([])

    const req = new Request("http://localhost", { headers: headers() })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it("GET retorna pedidos formatados", async () => {
    mockPrisma.pedido.findMany.mockResolvedValue([
      {
        id: 1,
        usuarioId: 1,
        total: 59.8,
        status: "FINALIZADO",
        invoiceNumber: "INV-123",
        createdAt: new Date("2026-06-01"),
        itens: [
          { id: 1, name: "Produto", quantity: 2, unitPrice: 29.9, subtotal: 59.8 },
        ],
      },
    ])

    const req = new Request("http://localhost", { headers: headers() })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.length).toBe(1)
    expect(body[0].total).toBe(59.8)
    expect(body[0].status).toBe("FINALIZADO")
    expect(body[0].invoiceNumber).toBe("INV-123")
    expect(body[0].items[0].name).toBe("Produto")
  })

  // ─── POST ────────────────────────────────────────────────────────────────

  it("POST retorna 400 com carrinho vazio", async () => {
    mockPrisma.carrinho.findFirst.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Carrinho vazio")
  })

  it("POST retorna 400 com carrinho sem itens", async () => {
    mockPrisma.carrinho.findFirst.mockResolvedValue(mockCart([]))

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("POST cria pedido e limpa carrinho", async () => {
    const cartItem = mockCartItem()
    mockPrisma.carrinho.findFirst.mockResolvedValue(mockCart([cartItem]))
    mockPrisma.pedido.create.mockResolvedValue({
      id: 10,
      usuarioId: 1,
      total: 59.8,
      status: "FINALIZADO",
      invoiceNumber: "INV-123456",
      createdAt: new Date(),
      itens: [
        {
          id: 1,
          name: "Produto",
          quantity: 2,
          unitPrice: 29.9,
          subtotal: 59.8,
          produtoId: 1,
          servicoId: null,
        },
      ],
    })
    mockPrisma.itens.deleteMany.mockResolvedValue({ count: 1 })

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.total).toBe(59.8)
    expect(body.invoiceNumber).toBe("INV-123456")
    expect(body.items.length).toBe(1)

    expect(mockPrisma.itens.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { carrinhoId: 1 } })
    )
  })

  it("POST cria pedido com item de serviço", async () => {
    const servicoItem = mockCartItem({
      produtoId: null,
      servicoId: 2,
      name: "Serviço de Limpeza",
      unitPrice: 150,
      subtotal: 150,
      produto: null,
      servico: { id: 2, name: "Serviço de Limpeza", price: 150 },
    })
    mockPrisma.carrinho.findFirst.mockResolvedValue(mockCart([servicoItem]))
    mockPrisma.pedido.create.mockResolvedValue({
      id: 11,
      usuarioId: 1,
      total: 150,
      status: "FINALIZADO",
      invoiceNumber: "INV-654321",
      createdAt: new Date(),
      itens: [
        { id: 2, name: "Serviço de Limpeza", quantity: 1, unitPrice: 150, subtotal: 150 },
      ],
    })
    mockPrisma.itens.deleteMany.mockResolvedValue({ count: 1 })

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.total).toBe(150)
  })

  it("POST usa fallback 0 e 'Item' quando servico não tem price/name", async () => {
    const servicoItem = mockCartItem({
      produtoId: null,
      servicoId: 3,
      name: "Serviço Genérico",
      unitPrice: 0,
      subtotal: 0,
      produto: null,
      servico: { id: 3 },
    })
    mockPrisma.carrinho.findFirst.mockResolvedValue(mockCart([servicoItem]))
    mockPrisma.pedido.create.mockResolvedValue({
      id: 12,
      usuarioId: 1,
      total: 0,
      status: "FINALIZADO",
      invoiceNumber: "INV-000",
      createdAt: new Date(),
      itens: [
        { id: 3, name: "Serviço Genérico", quantity: 1, unitPrice: 0, subtotal: 0 },
      ],
    })
    mockPrisma.itens.deleteMany.mockResolvedValue({ count: 1 })

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockPrisma.pedido.create).toHaveBeenCalled()
  })

  it("POST trata erro Prisma", async () => {
    mockPrisma.carrinho.findFirst.mockRejectedValue(new Error("DB error"))

    const req = new Request("http://localhost", {
      method: "POST",
      headers: headers(),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
