import {
  describe,
  test,
  expect
} from "vitest"

import {
  POST,
  GET
} from "../app/api/orders/route.js"

import {
  cart
} from "../app/data/store.js"

describe(
  "orders route",
  () => {

    test(
      "cria pedido",
      async () => {

        cart.length = 0

        cart.push({
          id: 1,
          name: "Produto",
          price: 10,
          quantity: 2
        })

        const response =
          await POST()

        expect(
          response.status
        ).toBe(201)

        const data =
          await response.json()

        expect(
          data.total
        ).toBe(20)

      }
    )

    test(
      "erro carrinho vazio",
      async () => {

        cart.length = 0

        const response =
          await POST()

        expect(
          response.status
        ).toBe(400)

      }
    )

    test(
      "GET retorna pedidos",
      async () => {

        const response =
          await GET()

        const data =
          await response.json()

        expect(
          Array.isArray(data)
        ).toBe(true)

      }
    )

  }
)