import {
  beforeEach,
  describe,
  expect,
  it
} from "vitest"

import {
  GET,
  POST
} from "../app/api/appointments/route.js"

import {
  appointments,
  services
} from "../app/data/store.js"

describe(
  "appointments API route",
  () => {

    beforeEach(() => {

      appointments.length = 0
      services.length = 0

    })

    it(
      "returns 400 for invalid appointment payload",
      async () => {

        const response = await POST({
          json: async () => ({})
        })

        expect(response.status).toBe(400)

        const body = await response.json()

        expect(body.error).toBeDefined()

      }
    )

    it(
      "returns 409 for appointment conflict using old payload format",
      async () => {

        const payload = {
          servicoId: 1,
          scheduledAt: "2030-01-01T10:00"
        }

        const firstResponse = await POST({
          json: async () => payload
        })

        const secondResponse = await POST({
          json: async () => payload
        })

        expect(firstResponse.status).toBe(201)
        expect(secondResponse.status).toBe(409)

        const body = await secondResponse.json()

        expect(body.error).toBe("Horário indisponível")

      }
    )

    it(
      "returns 400 when service does not exist in client flow",
      async () => {

        const response = await POST({
          json: async () => ({
            serviceId: 999,
            date: "2030-01-01",
            time: "10:00"
          })
        })

        expect(response.status).toBe(400)

        const body = await response.json()

        expect(body.error).toBe("Serviço não encontrado")

      }
    )

    it(
      "returns 400 when selected day is not available",
      async () => {

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

        const response = await POST({
          json: async () => ({
            serviceId: 1,
            date: "2030-01-01",
            time: "10:00"
          })
        })

        expect(response.status).toBe(400)

        const body = await response.json()

        expect(body.error).toBe("Dia indisponível")

      }
    )

    it(
      "returns 400 when selected time is outside service range",
      async () => {

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

        const response = await POST({
          json: async () => ({
            serviceId: 1,
            date: "2030-01-01",
            time: "22:00"
          })
        })

        expect(response.status).toBe(400)

        const body = await response.json()

        expect(body.error).toBe("Horário indisponível")

      }
    )

    it(
      "returns 201 when appointment is valid in client flow",
      async () => {

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

        const response = await POST({
          json: async () => ({
            serviceId: 1,
            date: "2030-01-01",
            time: "10:00"
          })
        })

        expect(response.status).toBe(201)

        const body = await response.json()

        expect(body.success).toBe(true)
        expect(body.data.id).toBe(1)
        expect(body.data.serviceId).toBe(1)
        expect(body.data.servicoId).toBe(1)
        expect(body.data.serviceName).toBe("Corte de cabelo")
        expect(body.data.date).toBe("2030-01-01")
        expect(body.data.time).toBe("10:00")
        expect(body.data.scheduledAt).toBe("2030-01-01T10:00")

      }
    )

    it(
      "GET returns current appointments",
      async () => {

        const response = await GET()

        expect(response.status).toBe(200)

        const body = await response.json()

        expect(Array.isArray(body)).toBe(true)
        expect(body.length).toBe(0)

      }
    )

    it(
      "returns 400 when an unexpected error without status occurs",
      async () => {

        const response = await POST({
          json: async () => {
            throw new Error("Erro inesperado")
          }
        })

        expect(response.status).toBe(400)

        const body = await response.json()

        expect(body.error).toBe("Erro inesperado")

      }
    )

  }
)