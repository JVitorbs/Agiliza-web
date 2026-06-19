import { services } from "../../data/store.js"
import { ServiceService } from "../../services/ServiceService.js"
import { prisma } from "../../lib/prisma.js"

const useMemoryStore =
  process.env.NODE_ENV === "test"

export async function GET() {

  if (useMemoryStore) {
    return Response.json(services)
  }

  const dbServices =
    await prisma.servico.findMany({
      where: {
        active: true
      },
      orderBy: {
        id: "asc"
      }
    })

  return Response.json(dbServices)

}

export async function POST(req) {

  try {

    const body = await req.json()

    const serviceData = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      availableDays: body.availableDays,
      startTime: body.startTime,
      endTime: body.endTime
    }

    ServiceService.validateService(serviceData)

    if (useMemoryStore) {

      const service = {
        id: services.length + 1,
        ...serviceData
      }

      services.push(service)

      return Response.json(
        service,
        { status: 201 }
      )

    }

    const service =
      await prisma.servico.create({
        data: serviceData
      })

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

    if (useMemoryStore) {

      const service = services.find(
        item => item.id === body.id
      )

      if (!service) {
        throw new Error("Serviço não encontrado")
      }

      const updatedService = {
        ...service,
        name: body.name ?? service.name,
        description: body.description ?? service.description,
        price:
          body.price !== undefined
            ? Number(body.price)
            : service.price,
        availableDays: body.availableDays ?? service.availableDays,
        startTime: body.startTime ?? service.startTime,
        endTime: body.endTime ?? service.endTime
      }

      ServiceService.validateService(updatedService)

      service.name = updatedService.name
      service.description = updatedService.description
      service.price = updatedService.price
      service.availableDays = updatedService.availableDays
      service.startTime = updatedService.startTime
      service.endTime = updatedService.endTime

      return Response.json(service)

    }

    const existingService =
      await prisma.servico.findUnique({
        where: {
          id: Number(body.id)
        }
      })

    if (!existingService) {
      throw new Error("Serviço não encontrado")
    }

    const updatedService = {
      name: body.name ?? existingService.name,
      description: body.description ?? existingService.description,
      price:
        body.price !== undefined
          ? Number(body.price)
          : existingService.price,
      availableDays: body.availableDays ?? existingService.availableDays,
      startTime: body.startTime ?? existingService.startTime,
      endTime: body.endTime ?? existingService.endTime
    }

    ServiceService.validateService(updatedService)

    const service =
      await prisma.servico.update({
        where: {
          id: Number(body.id)
        },
        data: updatedService
      })

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

    if (useMemoryStore) {

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

    }

    const existingService =
      await prisma.servico.findUnique({
        where: {
          id: Number(body.id)
        }
      })

    if (!existingService) {
      throw new Error("Serviço não encontrado")
    }

    await prisma.servico.update({
      where: {
        id: Number(body.id)
      },
      data: {
        active: false
      }
    })

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