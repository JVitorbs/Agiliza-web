import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "../../../lib/prisma.js"

const JWT_SECRET = process.env.JWT_SECRET ?? "agiliza-secret-dev"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("agiliza_token")?.value

    if (!token) {
      return Response.json({ user: null }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET)

    let user = null

    if (payload.role === "funcionario" || payload.role === "admin") {
      user = await prisma.funcionario.findUnique({
        where: { id: Number(payload.sub) },
        include: { endereco: true },
      })
    } else {
      user = await prisma.usuario.findUnique({
        where: { id: Number(payload.sub) },
        include: { endereco: true },
      })
    }

    if (!user) {
      return Response.json({ user: payload })
    }

    return Response.json({
      user: {
        ...payload,
        phone: user.phone,
        endereco: user.endereco,
      },
    })
  } catch (err) {
    return Response.json({ user: null, error: err.message }, { status: 401 })
  }
}
