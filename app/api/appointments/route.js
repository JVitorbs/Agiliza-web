import { AppointmentService } from "../../services/AppointmentService.js"
import {
  appointments,
  services
} from "../../data/store.js"

const weekDays = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado"
]

export async function GET() {

  return Response.json(appointments)

}

export async function POST(req) {

  try {

    const body = await req.json()

    const serviceId =
      body.serviceId ?? body.servicoId

    const isClientFlow =
      body.serviceId !== undefined &&
      body.date &&
      body.time

    let service = null

    if (isClientFlow) {

      service = services.find(
        item => item.id === body.serviceId
      )

      if (!service) {
        throw new Error("Serviço não encontrado")
      }

      const selectedDay = weekDays[
        new Date(`${body.date}T00:00:00`).getDay()
      ]

      if (!service.availableDays.includes(selectedDay)) {
        throw new Error("Dia indisponível")
      }

      if (
        body.time < service.startTime ||
        body.time > service.endTime
      ) {
        throw new Error("Horário indisponível")
      }

    }

    const appointment = {
      id: appointments.length + 1,

      serviceId,
      servicoId: serviceId,

      serviceName:
        service?.name ??
        body.serviceName,

      date:
        body.date ??
        body.scheduledAt?.split("T")[0],

      time:
        body.time ??
        body.scheduledAt?.split("T")[1],

      scheduledAt:
        body.scheduledAt ??
        `${body.date}T${body.time}`
    }

    AppointmentService.validateAppointment(
      appointments,
      appointment
    )

    appointments.push(appointment)

    return Response.json(
      {
        success: true,
        data: appointment
      },
      {
        status: 201
      }
    )

  } catch (error) {

    const status = error?.status ?? 400

    return Response.json(
      {
        error: error.message
      },
      {
        status
      }
    )

  }

}