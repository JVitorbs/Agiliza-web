import { describe, it, expect } from "vitest"
import {
  GET,
  POST,
  PUT,
  DELETE
} from "../app/api/products/route.js"

describe("Products Route", () => {

  it("deve listar produtos", async () => {

    const response = await GET()

    expect(response.status).toBe(200)

  })

  it("deve cadastrar produto válido", async () => {

    const request = {
      json: async () => ({
        name: "Shampoo",
        description: "500ml",
        price: 20
      })
    }

    const response = await POST(request)

    expect(response.status).toBe(201)

    const body = await response.json()

    expect(body.name).toBe("Shampoo")

  })

  it("deve rejeitar produto sem nome", async () => {

    const request = {
      json: async () => ({
        description: "500ml",
        price: 20
      })
    }

    const response = await POST(request)

    expect(response.status).toBe(400)

    const body = await response.json()

    expect(body.error).toBe("Nome obrigatório")

  })

  it("deve rejeitar produto sem preço", async () => {

    const request = {
      json: async () => ({
        name: "Shampoo"
      })
    }

    const response = await POST(request)

    expect(response.status).toBe(400)

    const body = await response.json()

    expect(body.error).toBe("Preço obrigatório")

  })

  it("deve editar preço de produto existente", async () => {

    const createRequest = {
      json: async () => ({
        name: "Condicionador",
        description: "200ml",
        price: 15
      })
    }

    await POST(createRequest)

    const updateRequest = {
      json: async () => ({
        id: 2,
        price: 18
      })
    }

    const response = await PUT(updateRequest)

    expect(response.status).toBe(200)

    const body = await response.json()

    expect(body.price).toBe(18)

  })

  it("deve atualizar nome e descrição mantendo o preço", async () => {

    const createRequest = {
      json: async () => ({
        name: "Produto Original",
        description: "Descrição Original",
        price: 10
      })
    }

    await POST(createRequest)

    const updateRequest = {
      json: async () => ({
        id: 3,
        name: "Produto Novo",
        description: "Descrição Nova"
      })
    }

    const response = await PUT(updateRequest)

    expect(response.status).toBe(200)

    const body = await response.json()

    expect(body.name).toBe("Produto Novo")
    expect(body.description).toBe("Descrição Nova")
    expect(body.price).toBe(10)

  })

  it("deve rejeitar edição de produto inexistente", async () => {

    const request = {
      json: async () => ({
        id: 999,
        price: 50
      })
    }

    const response = await PUT(request)

    expect(response.status).toBe(400)

    const body = await response.json()

    expect(body.error).toBe("Produto não encontrado")

  })

  it("deve remover produto existente", async () => {

    const createRequest = {
      json: async () => ({
        name: "Sabonete",
        description: "Neutro",
        price: 5
      })
    }

    await POST(createRequest)

    const deleteRequest = {
      json: async () => ({
        id: 4
      })
    }

    const response = await DELETE(deleteRequest)

    expect(response.status).toBe(200)

    const body = await response.json()

    expect(body.success).toBe(true)

  })

  it("deve rejeitar remoção de produto inexistente", async () => {

    const deleteRequest = {
      json: async () => ({
        id: 999
      })
    }

    const response = await DELETE(deleteRequest)

    expect(response.status).toBe(400)

    const body = await response.json()

    expect(body.error).toBe("Produto não encontrado")

  })

  it("deve tratar erro interno no PUT", async () => {

    const request = {
      json: async () => {
        throw new Error("Falha no JSON")
      }
    }

    const response = await PUT(request)

    expect(response.status).toBe(400)

    const body = await response.json()

    expect(body.error).toBe("Falha no JSON")

  })

  it("deve tratar erro interno no DELETE", async () => {

    const request = {
      json: async () => {
        throw new Error("Falha no JSON")
      }
    }

    const response = await DELETE(request)

    expect(response.status).toBe(400)

    const body = await response.json()

    expect(body.error).toBe("Falha no JSON")

  })

})