import { describe, expect, it } from "vitest"
import { AppointmentService } from "../app/services/AppointmentService.js"

function generateRandomDate() {

  const invalidDates = [
    "banana",
    "32/99/2020",
    "",
    null,
    undefined,
    "2030-99-99 99:99"
  ]

  const shouldGenerateInvalid =
    Math.random() < 0.3

  if (shouldGenerateInvalid) {
    return invalidDates[
      Math.floor(Math.random() * invalidDates.length)
    ]
  }

  const future = new Date()

  future.setDate(
    future.getDate() +
    Math.floor(Math.random() * 365)
  )

  future.setHours(
    Math.floor(Math.random() * 24)
  )

  future.setMinutes(
    Math.floor(Math.random() * 60)
  )

  return future
    .toISOString()
    .slice(0, 16)
    .replace("T", " ")
}

function generatePastDate() {

  const past = new Date()

  past.setDate(
    past.getDate() -
    Math.floor(Math.random() * 365)
  )

  return past
    .toISOString()
    .slice(0, 16)
    .replace("T", " ")
}

describe("AppointmentService Random Tests", () => {

  it("deve validar agendamentos aleatórios", () => {

    const appointments = []

    for (let i = 0; i < 100; i++) {

      const randomService =
        Math.floor(Math.random() * 10) + 1

      const shouldRepeatDate =
        Math.random() < 0.2

      let randomDate

      if (
        shouldRepeatDate &&
        appointments.length > 0
      ) {

        const randomExistingAppointment =
          appointments[
            Math.floor(
              Math.random() *
              appointments.length
            )
          ]

        randomDate =
          randomExistingAppointment.scheduledAt

      } else {

        randomDate =
          Math.random() < 0.5
            ? generateRandomDate()
            : generatePastDate()

      }

      const appointment = {
        servicoId: randomService,
        scheduledAt: randomDate
      }

      try {

        const result =
          AppointmentService.validateAppointment(
            appointments,
            appointment
          )

        expect(result).toBe(true)

        appointments.push(appointment)

      } catch (error) {

        expect(error).toBeInstanceOf(Error)

      }

    }

  })

  it("deve impedir conflito de horário", () => {

    const appointments = [
      {
        servicoId: 1,
        scheduledAt: "2030-10-10 14:00"
      }
    ]

    expect(() => {

      AppointmentService.validateAppointment(
        appointments,
        {
          servicoId: 1,
          scheduledAt: "2030-10-10 14:00"
        }
      )

    }).toThrow("Horário indisponível")

  })

  it("deve exigir data obrigatória", () => {

    expect(() => {

      AppointmentService.validateAppointment([], {
        servicoId: 1
      })

    }).toThrow("A data é obrigatória")

  })

  it("deve exigir o id serviço obrigatório", () => {

    expect(() => {

      AppointmentService.validateAppointment([], {
        scheduledAt: "2030-10-10 15:00"
      })

    }).toThrow("O ID do serviço é obrigatório")

  })

})