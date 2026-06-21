import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "../../../lib/prisma.js"

const JWT_SECRET = process.env.JWT_SECRET ?? "agiliza-secret-dev"

function getPayload(request) {
  const token = request.cookies?.get("agiliza_token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function GET(request) {
  try {
    const payload = getPayload(request)
    if (!payload || payload.role !== "empresa") {
      return Response.json({ error: "Não autorizado" }, { status: 403 })
    }

    const funcionarios = await prisma.funcionario.findMany({
      where: { empresaId: Number(payload.sub) },
      select: { id: true, name: true, email: true, phone: true, active: true },
    })

    return Response.json(funcionarios)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const payload = getPayload(request)
    if (!payload || payload.role !== "empresa") {
      return Response.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { email } = await request.json()
    if (!email) {
      return Response.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const funcionario = await prisma.funcionario.findUnique({ where: { email } })
    if (!funcionario) {
      return Response.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    if (funcionario.empresaId) {
      if (funcionario.empresaId === Number(payload.sub)) {
        return Response.json({ error: "Funcionário já vinculado à sua empresa" }, { status: 409 })
      }
      return Response.json({ error: "Funcionário já vinculado a outra empresa" }, { status: 409 })
    }

    await prisma.funcionario.update({
      where: { id: funcionario.id },
      data: { empresaId: Number(payload.sub) },
    })

    return Response.json({ success: true, name: funcionario.name, email: funcionario.email })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const payload = getPayload(request)
    if (!payload || payload.role !== "empresa") {
      return Response.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { id } = await request.json()
    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const funcionario = await prisma.funcionario.findUnique({ where: { id: Number(id) } })
    if (!funcionario) {
      return Response.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    if (funcionario.empresaId !== Number(payload.sub)) {
      return Response.json({ error: "Funcionário não pertence à sua empresa" }, { status: 403 })
    }

    await prisma.funcionario.update({
      where: { id: Number(id) },
      data: { empresaId: null },
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
