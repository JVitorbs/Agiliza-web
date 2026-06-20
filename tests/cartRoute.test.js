import {
  describe,
  test,
  expect
} from "vitest"

import {
  GET,
  POST,
  DELETE
} from "../app/api/cart/route.js"

describe(
  "cart route",
  () => {

    test(
      "GET retorna array",
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

    test(
      "POST adiciona item",
      async () => {

        const response =
          await POST({
            json: async () => ({
              id: 1,
              name: "Produto",
              price: 10
            })
          })

        expect(
          response.status
        ).toBe(201)

        const data =
          await response.json()

        expect(
          Array.isArray(data)
        ).toBe(true)

      }
    )

    test(
      "POST retorna erro",
      async () => {

        const response =
          await POST({
            json: async () => {
              throw new Error(
                "Erro de teste"
              )
            }
          })

        expect(
          response.status
        ).toBe(400)

        const data =
          await response.json()

        expect(
          data.error
        ).toBe("Erro de teste")

      }
    )

    test(
      "DELETE remove item",
      async () => {

        await POST({
          json: async () => ({
            id: 2,
            name: "Produto 2",
            price: 20
          })
        })

        const response =
          await DELETE({
            json: async () => ({
              id: 2
            })
          })

        expect(
          response.status
        ).toBe(200)

        const data =
          await response.json()

        expect(
          data.success
        ).toBe(true)

      }
    )

    test(
      "DELETE retorna erro para item inexistente",
      async () => {

        const response =
          await DELETE({
            json: async () => ({
              id: 99999
            })
          })

        expect(
          response.status
        ).toBe(400)

        const data =
          await response.json()

        expect(
          data.error
        ).toBe(
          "Produto não encontrado no carrinho"
        )

      }
    )

  }
)