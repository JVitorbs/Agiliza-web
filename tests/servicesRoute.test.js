import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ─── In-memory store tests ───────────────────────────────────────────────────

describe("Services Route — in-memory store", () => {
  let GET, POST, PUT, DELETE

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv("NODE_ENV", "test")

    const mod = await import("../app/api/services/route.js")
    GET = mod.GET
    POST = mod.POST
    PUT = mod.PUT
    DELETE = mod.DELETE
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("GET retorna lista vazia inicialmente", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it("POST cria serviço válido", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        name: "Limpeza",
        price: 100,
        availableDays: ["segunda"],
        startTime: "08:00",
        endTime: "18:00",
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe(1)
    expect(body.name).toBe("Limpeza")
    expect(body.price).toBe(100)
  })

  it("POST rejeita serviço sem nome", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ price: 100, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Nome obrigatório")
  })

  it("POST rejeita serviço sem preço", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Teste", availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Preço obrigatório")
  })

  it("POST rejeita serviço com preço zero", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Teste", price: 0, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Preço inválido")
  })

  it("POST rejeita serviço sem availableDays", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Teste", price: 100, startTime: "08:00", endTime: "18:00" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Selecione pelo menos um dia")
  })

  it("POST rejeita JSON inválido", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: "invalid-json",
      headers: { "Content-Type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("PUT edita serviço existente", async () => {
    // Cria um serviço primeiro
    const createReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Original", price: 50, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    await POST(createReq)

    const updateReq = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 1, name: "Editado", price: 75 }),
    })
    const res = await PUT(updateReq)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Editado")
    expect(body.price).toBe(75)
  })

  it("PUT em serviço inexistente retorna erro", async () => {
    const req = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 999, name: "X" }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Serviço não encontrado")
  })

  it("PUT edição parcial preserva campos não enviados", async () => {
    const createReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Completo", price: 100, availableDays: ["segunda", "terca"], startTime: "08:00", endTime: "18:00" }),
    })
    await POST(createReq)

    const updateReq = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 1, price: 200 }),
    })
    const res = await PUT(updateReq)
    const body = await res.json()
    expect(body.name).toBe("Completo")
    expect(body.price).toBe(200)
  })

  it("PUT sem price preserva preço original na memória", async () => {
    const createReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Preservar", price: 75, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    await POST(createReq)

    const updateReq = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 1, name: "Só Nome" }),
    })
    const res = await PUT(updateReq)
    const body = await res.json()
    expect(body.name).toBe("Só Nome")
    expect(body.price).toBe(75)
  })

  it("DELETE remove serviço existente", async () => {
    const createReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Remover", price: 50, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    await POST(createReq)

    const deleteReq = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ id: 1 }),
    })
    const res = await DELETE(deleteReq)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    // Verifica que a lista está vazia
    const getRes = await GET()
    const list = await getRes.json()
    expect(list.length).toBe(0)
  })

  it("DELETE em serviço inexistente retorna erro", async () => {
    const req = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ id: 999 }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Serviço não encontrado")
  })
})

// ─── Prisma mock tests ───────────────────────────────────────────────────────

describe("Services Route — Prisma mode", () => {
  let GET, POST, PUT, DELETE
  const mockPrisma = {
    servico: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  }

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv("NODE_ENV", "development")

    vi.doMock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

    const mod = await import("../app/api/services/route.js")
    GET = mod.GET
    POST = mod.POST
    PUT = mod.PUT
    DELETE = mod.DELETE
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("GET lista serviços do Prisma com include empresa.endereco", async () => {
    mockPrisma.servico.findMany.mockResolvedValue([
      { id: 1, name: "Serviço Prisma", price: 150, empresa: { id: 1, name: "Agiliza", endereco: { city: "São Paulo", state: "SP" } } },
    ])

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.length).toBe(1)
    expect(body[0].name).toBe("Serviço Prisma")

    expect(mockPrisma.servico.findMany).toHaveBeenCalledWith({
      where: { active: true },
      include: {
        empresa: {
          select: {
            id: true,
            name: true,
            endereco: { select: { city: true, state: true, street: true, zipCode: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    })
  })

  it("POST cria serviço via Prisma", async () => {
    mockPrisma.servico.create.mockResolvedValue({ id: 1, name: "Novo", price: 200 })

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "x-user-empresa-id": "1" },
      body: JSON.stringify({ name: "Novo", price: 200, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.name).toBe("Novo")

    expect(mockPrisma.servico.create).toHaveBeenCalledWith({
      data: { name: "Novo", description: undefined, price: 200, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00", empresaId: 1 },
    })
  })

  it("POST usa body.empresaId quando header não está presente", async () => {
    mockPrisma.servico.create.mockResolvedValue({ id: 2, name: "Via Body", price: 300 })

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Via Body", price: 300, empresaId: 5, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.name).toBe("Via Body")
  })

  it("PUT atualiza serviço existente via Prisma", async () => {
    mockPrisma.servico.findUnique.mockResolvedValue({ id: 1, name: "Antigo", price: 100, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" })
    mockPrisma.servico.update.mockResolvedValue({ id: 1, name: "Atualizado", price: 150 })

    const req = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 1, name: "Atualizado", price: 150 }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Atualizado")
  })

  it("PUT em serviço inexistente retorna erro", async () => {
    mockPrisma.servico.findUnique.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 999 }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Serviço não encontrado")
  })

  it("PUT edição parcial sem price preserva preço via Prisma", async () => {
    mockPrisma.servico.findUnique.mockResolvedValue({ id: 1, name: "Original", price: 100, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" })
    mockPrisma.servico.update.mockResolvedValue({ id: 1, name: "Só Nome", price: 100 })

    const req = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 1, name: "Só Nome" }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Só Nome")
    expect(body.price).toBe(100)
  })

  it("PUT edição parcial sem name preserva nome via Prisma", async () => {
    mockPrisma.servico.findUnique.mockResolvedValue({ id: 1, name: "Original", price: 100, availableDays: ["segunda"], startTime: "08:00", endTime: "18:00" })
    mockPrisma.servico.update.mockResolvedValue({ id: 1, name: "Original", price: 200 })

    const req = new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ id: 1, price: 200 }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Original")
    expect(body.price).toBe(200)
  })

  it("DELETE desativa serviço via Prisma (soft delete)", async () => {
    mockPrisma.servico.findUnique.mockResolvedValue({ id: 1, name: "Remover" })
    mockPrisma.servico.update.mockResolvedValue({ id: 1, active: false })

    const req = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ id: 1 }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    expect(mockPrisma.servico.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { active: false },
    })
  })

  it("DELETE em serviço inexistente retorna erro", async () => {
    mockPrisma.servico.findUnique.mockResolvedValue(null)

    const req = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ id: 999 }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Serviço não encontrado")
  })
})
