import { beforeEach, describe, expect, it, vi } from "vitest"

describe("appointments API route", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("returns 400 for invalid appointment payload", async () => {
    const { POST } = await import("../app/api/appointments/route")

    const response = await POST(new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        nomeCliente: "João",
        servicoId: "corte",
        scheduledAt: "2024-01-01T10:00:00.000Z"
      })
    }))

    expect(response.status).toBe(400)
  })

  it("returns 409 for appointment conflict", async () => {
    const { POST } = await import("../app/api/appointments/route")
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const appointment = {
      nomeCliente: "João",
      servicoId: "corte",
      scheduledAt
    }

    const firstResponse = await POST(new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointment)
    }))
    const secondResponse = await POST(new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointment)
    }))

    expect(firstResponse.status).toBe(201)
    expect(secondResponse.status).toBe(409)
  })
})
