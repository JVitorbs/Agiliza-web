import jwt from "jsonwebtoken"
import { prisma } from "../../../lib/prisma.js"

const JWT_SECRET = process.env.JWT_SECRET ?? "agiliza-secret-dev"

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getPayload(request) {
  const token = request.cookies?.get("agiliza_token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function getUltimos7Dias() {
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    dias.push(d)
  }
  return dias
}

function agruparAgendamentosPorDia(agendamentos, dias) {
  const mapa = new Map()
  for (const a of agendamentos) {
    const chave = new Date(a.scheduledAt).toDateString()
    mapa.set(chave, (mapa.get(chave) || 0) + 1)
  }
  return dias.map((d) => ({
    dia: DIAS_SEMANA[d.getDay()],
    total: mapa.get(d.toDateString()) || 0,
  }))
}

function agruparAgendamentosPorServico(agendamentos) {
  const mapa = new Map()
  for (const a of agendamentos) {
    const nome = a.servico.name
    mapa.set(nome, (mapa.get(nome) || 0) + 1)
  }
  return Array.from(mapa.entries()).map(([servico, total]) => ({
    servico,
    total,
  }))
}

function agruparVendasPorDia(itens, dias) {
  const mapa = new Map()
  for (const item of itens) {
    const chave = new Date(item.pedido.createdAt).toDateString()
    mapa.set(chave, (mapa.get(chave) || 0) + item.quantity)
  }
  return dias.map((d) => ({
    dia: DIAS_SEMANA[d.getDay()],
    total: mapa.get(d.toDateString()) || 0,
  }))
}

export async function GET(request) {
  try {
    const payload = getPayload(request)
    if (!payload || payload.role !== "empresa") {
      return Response.json({ error: "Não autorizado" }, { status: 403 })
    }

    const empresaId = Number(payload.sub)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6)
    seteDiasAtras.setHours(0, 0, 0, 0)

    const [totalFuncionarios, totalProdutos, totalServicos, totalAgendamentos, agendamentosRecentes, todosAgendamentos, pedidosRecentes] =
      await prisma.$transaction([
        prisma.funcionario.count({ where: { empresaId, active: true } }),
        prisma.produto.count({ where: { empresaId } }),
        prisma.servico.count({ where: { empresaId } }),
        prisma.agendamento.count({ where: { servico: { empresaId } } }),
        prisma.agendamento.findMany({
          where: { servico: { empresaId }, scheduledAt: { gte: seteDiasAtras } },
          select: { scheduledAt: true, servico: { select: { name: true } } },
          orderBy: { scheduledAt: "asc" },
        }),
        prisma.agendamento.findMany({
          where: { servico: { empresaId } },
          select: { servico: { select: { name: true } } },
        }),
        prisma.pedidoItem.findMany({
          where: { produto: { empresaId }, pedido: { createdAt: { gte: seteDiasAtras }, status: "FINALIZADO" } },
          select: { quantity: true, pedido: { select: { createdAt: true } } },
          orderBy: { pedido: { createdAt: "asc" } },
        }),
      ])

    const ultimos7Dias = getUltimos7Dias()
    const agendamentosPorDia = agruparAgendamentosPorDia(agendamentosRecentes, ultimos7Dias)
    const agendamentosPorServico = agruparAgendamentosPorServico(todosAgendamentos)
    const vendasPorDia = agruparVendasPorDia(pedidosRecentes, ultimos7Dias)

    return Response.json({
      totalFuncionarios,
      totalProdutos,
      totalServicos,
      totalAgendamentos,
      agendamentosPorDia,
      agendamentosPorServico,
      vendasPorDia,
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
