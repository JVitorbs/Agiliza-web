import { describe, it, expect } from "vitest"
import { ServiceService } from "../app/services/ServiceService.js"
import { ProductService } from "../app/services/ProductService.js"

// ─── ServiceService ──────────────────────────────────────────────────────────

describe("ServiceService.validateService", () => {
  const valid = {
    name: "Limpeza",
    price: 100,
    availableDays: ["segunda", "terca"],
    startTime: "08:00",
    endTime: "18:00",
  }

  it("aceita dados válidos", () => {
    expect(ServiceService.validateService(valid)).toBe(true)
  })

  it("rejeita sem nome", () => {
    expect(() => ServiceService.validateService({ ...valid, name: "" })).toThrow("Nome obrigatório")
  })

  it("rejeita sem nome (undefined)", () => {
    expect(() => ServiceService.validateService({ ...valid, name: undefined })).toThrow("Nome obrigatório")
  })

  it("rejeita sem preço", () => {
    expect(() => ServiceService.validateService({ ...valid, price: undefined })).toThrow("Preço obrigatório")
  })

  it("rejeita preço null", () => {
    expect(() => ServiceService.validateService({ ...valid, price: null })).toThrow("Preço obrigatório")
  })

  it("rejeita preço zero", () => {
    expect(() => ServiceService.validateService({ ...valid, price: 0 })).toThrow("Preço inválido")
  })

  it("rejeita preço negativo", () => {
    expect(() => ServiceService.validateService({ ...valid, price: -1 })).toThrow("Preço inválido")
  })

  it("rejeita sem availableDays", () => {
    expect(() => ServiceService.validateService({ ...valid, availableDays: undefined })).toThrow("Selecione pelo menos um dia")
  })

  it("rejeita availableDays não array", () => {
    expect(() => ServiceService.validateService({ ...valid, availableDays: "segunda" })).toThrow("Selecione pelo menos um dia")
  })

  it("rejeita availableDays vazio", () => {
    expect(() => ServiceService.validateService({ ...valid, availableDays: [] })).toThrow("Selecione pelo menos um dia")
  })

  it("rejeita sem startTime", () => {
    expect(() => ServiceService.validateService({ ...valid, startTime: "" })).toThrow("Informe horário inicial e final")
  })

  it("rejeita sem endTime", () => {
    expect(() => ServiceService.validateService({ ...valid, endTime: "" })).toThrow("Informe horário inicial e final")
  })

  it("rejeita startTime >= endTime", () => {
    expect(() => ServiceService.validateService({ ...valid, startTime: "18:00", endTime: "08:00" })).toThrow("Horário inicial deve ser menor que o final")
  })

  it("rejeita startTime igual a endTime", () => {
    expect(() => ServiceService.validateService({ ...valid, startTime: "08:00", endTime: "08:00" })).toThrow("Horário inicial deve ser menor que o final")
  })
})

// ─── ProductService ──────────────────────────────────────────────────────────

describe("ProductService.validateProduct", () => {
  const valid = { name: "Produto X", price: 50 }

  it("aceita dados válidos", () => {
    expect(ProductService.validateProduct(valid)).toBe(true)
  })

  it("rejeita sem nome", () => {
    expect(() => ProductService.validateProduct({ ...valid, name: "" })).toThrow("Nome obrigatório")
  })

  it("rejeita sem nome (undefined)", () => {
    expect(() => ProductService.validateProduct({ ...valid, name: undefined })).toThrow("Nome obrigatório")
  })

  it("rejeita sem preço", () => {
    expect(() => ProductService.validateProduct({ ...valid, price: undefined })).toThrow("Preço obrigatório")
  })

  it("rejeita preço null", () => {
    expect(() => ProductService.validateProduct({ ...valid, price: null })).toThrow("Preço obrigatório")
  })

  it("rejeita preço zero", () => {
    expect(() => ProductService.validateProduct({ ...valid, price: 0 })).toThrow("Preço inválido")
  })

  it("rejeita preço negativo", () => {
    expect(() => ProductService.validateProduct({ ...valid, price: -10 })).toThrow("Preço inválido")
  })

  it("aceita preço 0.01", () => {
    expect(ProductService.validateProduct({ ...valid, price: 0.01 })).toBe(true)
  })
})
