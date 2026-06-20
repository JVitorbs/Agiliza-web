import { prisma } from "../../../lib/prisma.js"

export async function PATCH(req) {
  try {
    const userId = Number(req.headers.get("x-user-id"))
    if (!userId) {
      return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const { name, phone } = body
    const { street, city, state, zipCode, country } = body

    const hasProfileFields = name !== undefined || phone !== undefined
    const hasAddressFields = street !== undefined || city !== undefined || state !== undefined || zipCode !== undefined || country !== undefined

    if (hasProfileFields) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      const updated = await prisma.usuario.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
        },
      })

      return Response.json({ user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone } })
    }

    if (hasAddressFields) {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { enderecoId: true },
      })
      if (!user) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      const endereco = await prisma.endereco.update({
        where: { id: user.enderecoId },
        data: {
          ...(street !== undefined && { street }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(country !== undefined && { country }),
        },
      })

      return Response.json({ endereco })
    }

    return Response.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}
