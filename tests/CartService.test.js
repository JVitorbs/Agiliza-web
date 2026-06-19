import {
  describe,
  test,
  expect
} from "vitest"

import {
  CartService
} from "../app/services/CartService.js"

describe(
  "CartService",
  () => {

    test(
      "adiciona item",
      () => {

        const cart = []

        CartService.addItem(
          cart,
          {
            id: 1,
            name: "Produto",
            price: 10
          }
        )

        expect(
          cart.length
        ).toBe(1)

      }
    )

    test(
      "incrementa quantidade",
      () => {

        const cart = []

        CartService.addItem(
          cart,
          {
            id: 1,
            name: "Produto",
            price: 10
          }
        )

        CartService.addItem(
          cart,
          {
            id: 1,
            name: "Produto",
            price: 10
          }
        )

        expect(
          cart[0].quantity
        ).toBe(2)

      }
    )

    test(
      "remove item",
      () => {

        const cart = [
          {
            id: 1,
            name: "Produto",
            price: 10,
            quantity: 1
          }
        ]

        CartService.removeItem(
          cart,
          1
        )

        expect(
          cart.length
        ).toBe(0)

      }
    )

    test(
      "erro ao remover item inexistente",
      () => {

        const cart = []

        expect(() =>

          CartService.removeItem(
            cart,
            999
          )

        ).toThrow(
          "Produto não encontrado no carrinho"
        )

      }
    )

    test(
      "calcula total",
      () => {

        const total =
          CartService.calculateTotal([
            {
              price: 10,
              quantity: 2
            },
            {
              price: 20,
              quantity: 1
            }
          ])

        expect(total)
          .toBe(40)

      }
    )

  }
)