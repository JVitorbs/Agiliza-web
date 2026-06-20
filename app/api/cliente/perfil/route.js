import { prisma } from "../../../lib/prisma.js"

export async function PATCH(req) {
  try {
    const userId = Number(req.headers.get("x-user-id"))
    if (!userId) {
      return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { street, city, state, zipCode, country } = await req.json()

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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}
