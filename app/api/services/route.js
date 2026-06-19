import { services } from "../../data/store.js"

export async function GET() {

  return Response.json(services)

}

export async function POST(req) {

  try {

    const body = await req.json()

    if (!body.name) {
      throw new Error("Nome obrigatório")
    }

    if (Number(body.price) <= 0) {
      throw new Error("Preço inválido")
    }

    if (
      !body.availableDays ||
      !Array.isArray(body.availableDays) ||
      body.availableDays.length === 0
    ) {
      throw new Error("Selecione pelo menos um dia")
    }

    if (!body.startTime || !body.endTime) {
      throw new Error("Informe horário inicial e final")
    }

    if (body.startTime >= body.endTime) {
      throw new Error("Horário inicial deve ser menor que o final")
    }

    const service = {
      id: services.length + 1,
      name: body.name,
      description: body.description,
      price: Number(body.price),
      availableDays: body.availableDays,
      startTime: body.startTime,
      endTime: body.endTime
    }

    services.push(service)

    return Response.json(
      service,
      { status: 201 }
    )

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}

export async function PUT(req) {

  try {

    const body = await req.json()

    const service = services.find(
      item => item.id === body.id
    )

    if (!service) {
      throw new Error("Serviço não encontrado")
    }

    service.name = body.name ?? service.name
    service.description = body.description ?? service.description
    service.price =
      body.price !== undefined
        ? Number(body.price)
        : service.price
    service.availableDays = body.availableDays ?? service.availableDays
    service.startTime = body.startTime ?? service.startTime
    service.endTime = body.endTime ?? service.endTime

    return Response.json(service)

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}

export async function DELETE(req) {

  try {

    const body = await req.json()

    const index = services.findIndex(
      item => item.id === body.id
    )

    if (index === -1) {
      throw new Error("Serviço não encontrado")
    }

    services.splice(index, 1)

    return Response.json({
      success: true
    })

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}