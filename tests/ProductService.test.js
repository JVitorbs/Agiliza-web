import { describe, it, expect } from "vitest"
import { ProductService } from "../app/services/ProductService.js"

describe("ProductService", () => {

  it("deve validar produto válido", () => {

    expect(
      ProductService.validateProduct({
        name: "Shampoo",
        price: 20
      })
    ).toBe(true)

  })

  it("deve rejeitar produto sem nome", () => {

    expect(() =>
      ProductService.validateProduct({
        price: 20
      })
    ).toThrow()

  })

  it("deve rejeitar produto sem preço", () => {

    expect(() =>
      ProductService.validateProduct({
        name: "Shampoo"
      })
    ).toThrow()

  })

  it("deve rejeitar preço negativo", () => {

    expect(() =>
      ProductService.validateProduct({
        name: "Shampoo",
        price: -10
      })
    ).toThrow()

  })

})