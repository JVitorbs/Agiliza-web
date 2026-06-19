import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

const mockPrisma = vi.hoisted(() => ({
  produto: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  }
}))

vi.mock("../app/lib/prisma.js", () => ({
  prisma: mockPrisma
}))

async function loadProductsRoute(env = "test") {

  vi.resetModules()
  vi.stubEnv("NODE_ENV", env)

  return await import("../app/api/products/route.js")

}

describe("Products Route", () => {

  beforeEach(() => {

    vi.clearAllMocks()
    vi.unstubAllEnvs()

  })

  it("deve listar produtos usando memória em ambiente de teste", async () => {

    const { GET } =
      await loadProductsRoute("test")

    const response =
      await GET()

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(Array.isArray(body)).toBe(true)

  })

  it("deve cadastrar produto válido usando memória", async () => {

    const { POST } =
      await loadProductsRoute("test")

    const request = {
      json: async () => ({
        name: "Shampoo",
        description: "500ml",
        price: 20
      })
    }

    const response =
      await POST(request)

    expect(response.status).toBe(201)

    const body =
      await response.json()

    expect(body.name).toBe("Shampoo")
    expect(body.price).toBe(20)

  })

  it("deve rejeitar produto sem nome usando memória", async () => {

    const { POST } =
      await loadProductsRoute("test")

    const request = {
      json: async () => ({
        description: "500ml",
        price: 20
      })
    }

    const response =
      await POST(request)

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Nome obrigatório")

  })

  it("deve rejeitar produto sem preço usando memória", async () => {

    const { POST } =
      await loadProductsRoute("test")

    const request = {
      json: async () => ({
        name: "Shampoo"
      })
    }

    const response =
      await POST(request)

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Preço obrigatório")

  })

  it("deve editar produto existente usando memória", async () => {

    const {
      POST,
      PUT
    } = await loadProductsRoute("test")

    await POST({
      json: async () => ({
        name: "Condicionador",
        description: "200ml",
        price: 15
      })
    })

    const response =
      await PUT({
        json: async () => ({
          id: 1,
          name: "Condicionador Atualizado",
          price: 18
        })
      })

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(body.name).toBe("Condicionador Atualizado")
    expect(body.price).toBe(18)

  })

  it("deve rejeitar edição de produto inexistente usando memória", async () => {

    const { PUT } =
      await loadProductsRoute("test")

    const response =
      await PUT({
        json: async () => ({
          id: 999,
          price: 50
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Produto não encontrado")

  })

  it("deve remover produto existente usando memória", async () => {

    const {
      POST,
      DELETE
    } = await loadProductsRoute("test")

    await POST({
      json: async () => ({
        name: "Sabonete",
        description: "Neutro",
        price: 5
      })
    })

    const response =
      await DELETE({
        json: async () => ({
          id: 1
        })
      })

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(body.success).toBe(true)

  })

  it("deve rejeitar remoção de produto inexistente usando memória", async () => {

    const { DELETE } =
      await loadProductsRoute("test")

    const response =
      await DELETE({
        json: async () => ({
          id: 999
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Produto não encontrado")

  })

  it("deve tratar erro interno no POST", async () => {

    const { POST } =
      await loadProductsRoute("test")

    const response =
      await POST({
        json: async () => {
          throw new Error("Falha no JSON")
        }
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Falha no JSON")

  })

  it("deve listar produtos usando Prisma em ambiente de desenvolvimento", async () => {

    mockPrisma.produto.findMany.mockResolvedValue([
      {
        id: 1,
        name: "Produto Prisma",
        description: "Produto do banco",
        price: 30,
        active: true
      }
    ])

    const { GET } =
      await loadProductsRoute("development")

    const response =
      await GET()

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(body.length).toBe(1)
    expect(body[0].name).toBe("Produto Prisma")

    expect(mockPrisma.produto.findMany).toHaveBeenCalledWith({
      where: {
        active: true
      },
      orderBy: {
        id: "asc"
      }
    })

  })

  it("deve cadastrar produto usando Prisma em ambiente de desenvolvimento", async () => {

    mockPrisma.produto.create.mockResolvedValue({
      id: 1,
      name: "Produto Banco",
      description: "Descrição banco",
      price: 25,
      active: true
    })

    const { POST } =
      await loadProductsRoute("development")

    const response =
      await POST({
        json: async () => ({
          name: "Produto Banco",
          description: "Descrição banco",
          price: 25
        })
      })

    expect(response.status).toBe(201)

    const body =
      await response.json()

    expect(body.name).toBe("Produto Banco")

    expect(mockPrisma.produto.create).toHaveBeenCalledWith({
      data: {
        name: "Produto Banco",
        description: "Descrição banco",
        price: 25
      }
    })

  })

  it("deve editar produto usando Prisma em ambiente de desenvolvimento", async () => {

    mockPrisma.produto.findUnique.mockResolvedValue({
      id: 1,
      name: "Produto Antigo",
      description: "Antiga",
      price: 10
    })

    mockPrisma.produto.update.mockResolvedValue({
      id: 1,
      name: "Produto Novo",
      description: "Antiga",
      price: 20
    })

    const { PUT } =
      await loadProductsRoute("development")

    const response =
      await PUT({
        json: async () => ({
          id: 1,
          name: "Produto Novo",
          price: 20
        })
      })

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(body.name).toBe("Produto Novo")
    expect(body.price).toBe(20)

    expect(mockPrisma.produto.update).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        name: "Produto Novo",
        description: "Antiga",
        price: 20
      }
    })

  })

  it("deve rejeitar edição de produto inexistente usando Prisma", async () => {

    mockPrisma.produto.findUnique.mockResolvedValue(null)

    const { PUT } =
      await loadProductsRoute("development")

    const response =
      await PUT({
        json: async () => ({
          id: 999,
          name: "Produto Inexistente"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Produto não encontrado")

  })

  it("deve remover produto usando Prisma com exclusão lógica", async () => {

    mockPrisma.produto.findUnique.mockResolvedValue({
      id: 1,
      name: "Produto",
      active: true
    })

    mockPrisma.produto.update.mockResolvedValue({
      id: 1,
      active: false
    })

    const { DELETE } =
      await loadProductsRoute("development")

    const response =
      await DELETE({
        json: async () => ({
          id: 1
        })
      })

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(body.success).toBe(true)

    expect(mockPrisma.produto.update).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        active: false
      }
    })

  })

  it("deve rejeitar remoção de produto inexistente usando Prisma", async () => {

    mockPrisma.produto.findUnique.mockResolvedValue(null)

    const { DELETE } =
      await loadProductsRoute("development")

    const response =
      await DELETE({
        json: async () => ({
          id: 999
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Produto não encontrado")

  })

})