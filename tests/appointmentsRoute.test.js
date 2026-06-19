import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

const mockPrisma = vi.hoisted(() => ({
  servico: {
    findUnique: vi.fn()
  },
  agendamento: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn()
  }
}))

vi.mock("../app/lib/prisma.js", () => ({
  prisma: mockPrisma
}))

async function loadAppointmentsRoute(env = "test") {

  vi.resetModules()
  vi.stubEnv("NODE_ENV", env)

  return await import("../app/api/appointments/route.js")

}

describe("appointments API route", () => {

  beforeEach(() => {

    vi.clearAllMocks()
    vi.unstubAllEnvs()

  })

  it("returns 400 for invalid appointment payload using memory", async () => {

    const { POST } =
      await loadAppointmentsRoute("test")

    const response =
      await POST({
        json: async () => ({})
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBeDefined()

  })

  it("returns 409 for appointment conflict using old payload format", async () => {

    const { POST } =
      await loadAppointmentsRoute("test")

    const payload = {
      servicoId: 1,
      scheduledAt: "2030-01-01T10:00"
    }

    const firstResponse =
      await POST({
        json: async () => payload
      })

    const secondResponse =
      await POST({
        json: async () => payload
      })

    expect(firstResponse.status).toBe(201)
    expect(secondResponse.status).toBe(409)

    const body =
      await secondResponse.json()

    expect(body.error).toBe("Horário indisponível")

  })

  it("returns 400 when service does not exist in client flow using memory", async () => {

    const { POST } =
      await loadAppointmentsRoute("test")

    const response =
      await POST({
        json: async () => ({
          serviceId: 999,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Serviço não encontrado")

  })

  it("returns 400 when selected day is not available using memory", async () => {

    await loadAppointmentsRoute("test")

    const {
      POST
    } = await import("../app/api/appointments/route.js")

    const {
      services
    } = await import("../app/data/store.js")

    services.push({
      id: 1,
      name: "Corte de cabelo",
      description: "Corte masculino",
      price: 35,
      availableDays: [
        "segunda"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Dia indisponível")

  })

  it("returns 400 when selected time is outside service range using memory", async () => {

    await loadAppointmentsRoute("test")

    const {
      POST
    } = await import("../app/api/appointments/route.js")

    const {
      services
    } = await import("../app/data/store.js")

    services.push({
      id: 1,
      name: "Corte de cabelo",
      description: "Corte masculino",
      price: 35,
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "22:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Horário indisponível")

  })

  it("returns 201 when appointment is valid in client flow using memory", async () => {

    await loadAppointmentsRoute("test")

    const {
      POST
    } = await import("../app/api/appointments/route.js")

    const {
      services
    } = await import("../app/data/store.js")

    services.push({
      id: 1,
      name: "Corte de cabelo",
      description: "Corte masculino",
      price: 35,
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(201)

    const body =
      await response.json()

    expect(body.success).toBe(true)
    expect(body.data.id).toBe(1)
    expect(body.data.serviceId).toBe(1)
    expect(body.data.servicoId).toBe(1)
    expect(body.data.serviceName).toBe("Corte de cabelo")
    expect(body.data.date).toBe("2030-01-01")
    expect(body.data.time).toBe("10:00")
    expect(body.data.scheduledAt).toBe("2030-01-01T10:00")

  })

  it("GET returns current appointments using memory", async () => {

    const { GET } =
      await loadAppointmentsRoute("test")

    const response =
      await GET()

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(Array.isArray(body)).toBe(true)

  })

  it("returns 400 when an unexpected error without status occurs", async () => {

    const { POST } =
      await loadAppointmentsRoute("test")

    const response =
      await POST({
        json: async () => {
          throw new Error("Erro inesperado")
        }
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Erro inesperado")

  })

  it("GET returns appointments using Prisma in development", async () => {

    mockPrisma.agendamento.findMany.mockResolvedValue([
      {
        id: 1,
        servicoId: 1,
        date: "2030-01-01",
        time: "10:00",
        scheduledAt: new Date("2030-01-01T10:00:00"),
        servico: {
          name: "Corte de cabelo"
        }
      }
    ])

    const { GET } =
      await loadAppointmentsRoute("development")

    const response =
      await GET()

    expect(response.status).toBe(200)

    const body =
      await response.json()

    expect(body.length).toBe(1)
    expect(body[0].id).toBe(1)
    expect(body[0].serviceName).toBe("Corte de cabelo")
    expect(body[0].serviceId).toBe(1)
    expect(body[0].servicoId).toBe(1)

  })

  it("returns 400 when service does not exist using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue(null)

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 999,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Serviço não encontrado")

  })

  it("returns 400 when date is missing using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue({
      id: 1,
      name: "Corte de cabelo",
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          time: "10:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Data obrigatória")

  })

  it("returns 400 when time is missing using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue({
      id: 1,
      name: "Corte de cabelo",
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Horário obrigatório")

  })

  it("returns 400 when selected day is unavailable using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue({
      id: 1,
      name: "Corte de cabelo",
      availableDays: [
        "segunda"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Dia indisponível")

  })

  it("returns 400 when selected time is unavailable using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue({
      id: 1,
      name: "Corte de cabelo",
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "22:00"
        })
      })

    expect(response.status).toBe(400)

    const body =
      await response.json()

    expect(body.error).toBe("Horário indisponível")

  })

  it("returns 409 when appointment conflict exists using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue({
      id: 1,
      name: "Corte de cabelo",
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    mockPrisma.agendamento.findFirst.mockResolvedValue({
      id: 10
    })

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(409)

    const body =
      await response.json()

    expect(body.error).toBe("Horário indisponível")

  })

  it("returns 201 when appointment is valid using Prisma", async () => {

    mockPrisma.servico.findUnique.mockResolvedValue({
      id: 1,
      name: "Corte de cabelo",
      availableDays: [
        "terca"
      ],
      startTime: "08:00",
      endTime: "18:00"
    })

    mockPrisma.agendamento.findFirst.mockResolvedValue(null)

    mockPrisma.agendamento.create.mockResolvedValue({
      id: 1,
      servicoId: 1,
      date: "2030-01-01",
      time: "10:00"
    })

    const { POST } =
      await loadAppointmentsRoute("development")

    const response =
      await POST({
        json: async () => ({
          serviceId: 1,
          date: "2030-01-01",
          time: "10:00"
        })
      })

    expect(response.status).toBe(201)

    const body =
      await response.json()

    expect(body.success).toBe(true)
    expect(body.data.id).toBe(1)
    expect(body.data.serviceId).toBe(1)
    expect(body.data.serviceName).toBe("Corte de cabelo")
    expect(body.data.date).toBe("2030-01-01")
    expect(body.data.time).toBe("10:00")

    expect(mockPrisma.agendamento.create).toHaveBeenCalled()

  })

})