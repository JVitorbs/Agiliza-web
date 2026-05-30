import { AppointmentService } from "../../services/AppointmentService.js"

const appointments = []

export async function GET() {

  return Response.json(
    appointments
  )

}

export async function POST(req) {
  try {

    const body = await req.json()

    AppointmentService.validateAppointment(appointments, body)

    appointments.push(body)

    return Response.json({
      success: true,
      data: body
    }, {
      status: 201
    })

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