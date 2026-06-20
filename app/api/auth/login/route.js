import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "../../../lib/prisma.js"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET ?? "agiliza-secret-dev"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }

    // Tenta funcionário primeiro, depois usuário
    let principal = await prisma.funcionario.findUnique({ where: { email } })
    let role = "funcionario"

    if (!principal) {
      principal = await prisma.usuario.findUnique({ where: { email } })
      role = "cliente"
    }

    if (!principal) {
      return Response.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const passwordOk = await bcrypt.compare(password, principal.password ?? "")

    if (!passwordOk) {
      return Response.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    if (principal.active === false) {
      return Response.json({ error: "Conta inativa" }, { status: 403 })
    }

    const payload = {
      sub: principal.id,
      email: principal.email,
      name: principal.name,
      role,
      empresaId: role === "funcionario" ? principal.empresaId ?? null : null,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" })

    const cookieStore = await cookies()
    cookieStore.set("agiliza_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    })

    return Response.json({ success: true, user: payload })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
