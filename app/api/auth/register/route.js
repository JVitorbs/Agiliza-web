import bcrypt from "bcryptjs"
import { prisma } from "../../../lib/prisma.js"

const TYPES = ["cliente", "funcionario", "empresa"]

export async function POST(req) {
  try {
    const body = await req.json()
    const { type = "cliente" } = body

    if (!TYPES.includes(type)) {
      return Response.json({ error: "Tipo de cadastro inválido" }, { status: 400 })
    }

    if (type === "cliente") return createCliente(body)
    if (type === "funcionario") return createFuncionario(body)
    return createEmpresa(body)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

async function createCliente(body) {
  const { name, email, password, phone, cpf } = body

  if (!name || !email || !password || !phone || !cpf) {
    return Response.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  const existing = await prisma.usuario.findFirst({
    where: { OR: [{ email }, { cpf }] },
  })

  if (existing) {
    return Response.json({ error: "Email ou CPF já cadastrado" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const endereco = await prisma.endereco.create({
    data: {
      street: "A preencher",
      city: "A preencher",
      state: "XX",
      zipCode: "00000-000",
      country: "Brasil",
    },
  })

  const user = await prisma.usuario.create({
    data: { name, email, password: hashedPassword, phone, cpf, enderecoId: endereco.id },
  })

  return Response.json(
    { success: true, id: user.id, name: user.name, email: user.email, type: "cliente" },
    { status: 201 }
  )
}

async function createFuncionario(body) {
  const { name, email, password, phone, cpf, empresaId } = body

  if (!name || !email || !password || !phone || !cpf) {
    return Response.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  const existing = await prisma.funcionario.findFirst({
    where: { OR: [{ email }, { cpf }] },
  })

  if (existing) {
    return Response.json({ error: "Email ou CPF já cadastrado" }, { status: 409 })
  }

  if (empresaId) {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } })
    if (!empresa) {
      return Response.json({ error: "Empresa não encontrada" }, { status: 404 })
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const endereco = await prisma.endereco.create({
    data: {
      street: "A preencher",
      city: "A preencher",
      state: "XX",
      zipCode: "00000-000",
      country: "Brasil",
    },
  })

  const funcionario = await prisma.funcionario.create({
    data: { name, email, password: hashedPassword, phone, cpf, isManager: false, empresaId: empresaId || null, enderecoId: endereco.id },
  })

  return Response.json(
    { success: true, id: funcionario.id, name: funcionario.name, email: funcionario.email, type: "funcionario" },
    { status: 201 }
  )
}

async function createEmpresa(body) {
  const { name, razaoSocial, cnpj, email, phone, password } = body

  if (!name || !razaoSocial || !cnpj || !email || !phone || !password) {
    return Response.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  const existing = await prisma.empresa.findFirst({
    where: { OR: [{ email }, { cnpj }] },
  })

  if (existing) {
    return Response.json({ error: "Email ou CNPJ já cadastrado" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const endereco = await prisma.endereco.create({
    data: {
      street: "A preencher",
      city: "A preencher",
      state: "XX",
      zipCode: "00000-000",
      country: "Brasil",
    },
  })

  const empresa = await prisma.empresa.create({
    data: { name, razaoSocial, cnpj, email, phone, password: hashedPassword, enderecoId: endereco.id },
  })

  return Response.json(
    { success: true, id: empresa.id, name: empresa.name, email: empresa.email, type: "empresa" },
    { status: 201 }
  )
}
