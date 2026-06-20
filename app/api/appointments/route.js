import { AppointmentService } from "../../services/AppointmentService.js"
import {
  appointments,
  services
} from "../../data/store.js"
import { prisma } from "../../lib/prisma.js"
import { handlePrismaError } from "../../lib/error-handler.js"

const useMemoryStore =
  process.env.NODE_ENV === "test"

const weekDays = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado"
]

function getSelectedDay(date) {

  return weekDays[
    new Date(`${date}T00:00:00`).getDay()
  ]

}

function validateServiceAvailability(
  service,
  date,
  time
) {

  const selectedDay =
    getSelectedDay(date)

  if (
    !service.availableDays.includes(
      selectedDay
    )
  ) {
    throw new Error("Dia indisponível")
  }

  if (
    time < service.startTime ||
    time > service.endTime
  ) {
    throw new Error("Horário indisponível")
  }

}

export async function GET() {

  if (useMemoryStore) {
    return Response.json(appointments)
  }

  const dbAppointments =
    await prisma.agendamento.findMany({
      include: {
        servico: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

  const result =
    dbAppointments.map(
      appointment => ({
        id: appointment.id,
        serviceId: appointment.servicoId,
        servicoId: appointment.servicoId,
        serviceName: appointment.servico.name,
        date: appointment.date,
        time: appointment.time,
        scheduledAt:
          appointment.scheduledAt.toISOString()
      })
    )

  return Response.json(result)

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

    if (useMemoryStore) {

      let service = null

      if (isClientFlow) {

        service = services.find(
          item => item.id === body.serviceId
        )

        if (!service) {
          throw new Error("Serviço não encontrado")
        }

        validateServiceAvailability(
          service,
          body.date,
          body.time
        )

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

    }

    const userId = Number(req.headers?.get?.("x-user-id"))

    const service =
      await prisma.servico.findUnique({
        where: {
          id: Number(serviceId)
        }
      })

    if (!service) {
      throw new Error("Serviço não encontrado")
    }

    if (!body.date) {
      throw new Error("Data obrigatória")
    }

    if (!body.time) {
      throw new Error("Horário obrigatório")
    }

    validateServiceAvailability(
      service,
      body.date,
      body.time
    )

    const scheduledAt =
      `${body.date}T${body.time}`

    AppointmentService.validateDate(
      scheduledAt
    )

    const conflict =
      await prisma.agendamento.findFirst({
        where: {
          servicoId: Number(serviceId),
          date: body.date,
          time: body.time
        }
      })

    if (conflict) {

      return Response.json(
        {
          error: "Horário indisponível"
        },
        {
          status: 409
        }
      )

    }

    const dbAppointment =
      await prisma.agendamento.create({
        data: {
          servicoId: Number(serviceId),
          usuarioId: userId || null,
          date: body.date,
          time: body.time,
          scheduledAt:
            new Date(scheduledAt)
        }
      })

    const appointment = {
      id: dbAppointment.id,
      serviceId: dbAppointment.servicoId,
      servicoId: dbAppointment.servicoId,
      serviceName: service.name,
      date: dbAppointment.date,
      time: dbAppointment.time,
      scheduledAt
    }

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
    return handlePrismaError(error)
  }

}