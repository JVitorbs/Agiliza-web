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

  it("GET returns current appointments (initially empty)", async () => {
    const { GET } = await import("../app/api/appointments/route")

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it("returns 400 when an unexpected error without status occurs", async () => {
    const { POST } = await import("../app/api/appointments/route")

    // Sending invalid JSON body will cause req.json() to throw (no status property)
    const response = await POST(new Request("http://localhost/api/appointments", {
      method: "POST",
      body: "not-a-json"
    }))

    expect(response.status).toBe(400)
  })
})
