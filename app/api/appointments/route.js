import { NextResponse } from "next/server"

const appointments = []

export async function GET() {

  return NextResponse.json(
    appointments
  )

}

export async function POST(req) {

  try {

    const body = await req.json()

    appointments.push(body)

    return NextResponse.json({
      success: true,
      data: body
    })

  } catch (error) {

    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 400
      }
    )

  }

}