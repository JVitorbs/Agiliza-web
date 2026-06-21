import { beforeEach, describe, expect, it, vi } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn(),
  funcionario: { count: vi.fn() },
  produto: { count: vi.fn() },
  servico: { count: vi.fn() },
  agendamento: { count: vi.fn(), findMany: vi.fn() },
  pedidoItem: { findMany: vi.fn() },
}))

vi.mock("../app/lib/prisma.js", () => ({ prisma: mockPrisma }))

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

const mockJwt = vi.hoisted(() => ({
  default: { verify: vi.fn() },
}))

vi.mock("jsonwebtoken", () => mockJwt)

function makeReq({ token }) {
  return {
    cookies: {
      get: (name) => (name === "agiliza_token" && token ? { value: token } : undefined),
    },
  }
}

describe("Empresa Dashboard Route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna 403 sem token", async () => {
    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: null }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe("Não autorizado")
  })

  it("retorna 403 com token inválido (jwt.verify lança erro)", async () => {
    mockJwt.default.verify.mockImplementation(() => { throw new Error("jwt malformed") })
    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "invalido" }))
    expect(res.status).toBe(403)
  })

  it("retorna 403 com role inválida", async () => {
    mockJwt.default.verify.mockReturnValue({ sub: "1", role: "funcionario" })
    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "token-func" }))
    expect(res.status).toBe(403)
  })

  it("retorna métricas do dashboard", async () => {
    mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
    mockPrisma.$transaction.mockResolvedValue([10, 25, 8, 42, [], [], []])

    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "token-valido" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      totalFuncionarios: 10,
      totalProdutos: 25,
      totalServicos: 8,
      totalAgendamentos: 42,
      agendamentosPorDia: expect.any(Array),
      agendamentosPorServico: [],
      vendasPorDia: expect.any(Array),
    })
  })

  it("passa empresaId correto para as queries", async () => {
    mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
    mockPrisma.funcionario.count.mockResolvedValue(3)
    mockPrisma.produto.count.mockResolvedValue(7)
    mockPrisma.servico.count.mockResolvedValue(2)
    mockPrisma.agendamento.count.mockResolvedValue(15)
    mockPrisma.agendamento.findMany.mockResolvedValue([])
    mockPrisma.pedidoItem.findMany.mockResolvedValue([])
    mockPrisma.$transaction.mockResolvedValue([3, 7, 2, 15, [], [], []])

    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "token" }))
    expect(res.status).toBe(200)
    expect(mockPrisma.funcionario.count).toHaveBeenCalledWith({ where: { empresaId: 5, active: true } })
    expect(mockPrisma.produto.count).toHaveBeenCalledWith({ where: { empresaId: 5 } })
    expect(mockPrisma.servico.count).toHaveBeenCalledWith({ where: { empresaId: 5 } })
    expect(mockPrisma.agendamento.count).toHaveBeenCalledWith({ where: { servico: { empresaId: 5 } } })
    expect(mockPrisma.agendamento.findMany).toHaveBeenCalledTimes(2)
    expect(mockPrisma.pedidoItem.findMany).toHaveBeenCalledTimes(1)
  })

  it("retorna dados agregados dos agendamentos", async () => {
    mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
    const agora = new Date()
    const agendamentosRecentes = [
      { scheduledAt: new Date(agora.getTime() - 86400000), servico: { name: "Corte" } },
      { scheduledAt: new Date(agora.getTime() - 86400000), servico: { name: "Barba" } },
      { scheduledAt: new Date(agora.getTime()), servico: { name: "Corte" } },
    ]
    const todosAgendamentos = [
      { servico: { name: "Corte" } },
      { servico: { name: "Corte" } },
      { servico: { name: "Barba" } },
    ]
    mockPrisma.$transaction.mockResolvedValue([10, 25, 8, 3, agendamentosRecentes, todosAgendamentos, []])

    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "token" }))
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.totalFuncionarios).toBe(10)
    expect(body.totalProdutos).toBe(25)
    expect(body.totalServicos).toBe(8)
    expect(body.totalAgendamentos).toBe(3)

    expect(body.agendamentosPorDia).toBeInstanceOf(Array)
    expect(body.agendamentosPorDia).toHaveLength(7)

    const diasComAgendamento = body.agendamentosPorDia.filter((d) => d.total > 0)
    expect(diasComAgendamento.length).toBeGreaterThanOrEqual(1)

    expect(body.agendamentosPorServico).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ servico: "Corte", total: 2 }),
        expect.objectContaining({ servico: "Barba", total: 1 }),
      ])
    )
    expect(body.agendamentosPorServico).toHaveLength(2)

    expect(body.vendasPorDia).toBeInstanceOf(Array)
    expect(body.vendasPorDia).toHaveLength(7)
    expect(body.vendasPorDia.every((d) => d.total === 0)).toBe(true)
  })

  it("retorna vendasPorDia com dados de pedidos", async () => {
    mockJwt.default.verify.mockReturnValue({ sub: "5", role: "empresa" })
    const agora = new Date()
    const pedidosRecentes = [
      { quantity: 3, pedido: { createdAt: new Date(agora.getTime() - 2 * 86400000) } },
      { quantity: 1, pedido: { createdAt: new Date(agora.getTime() - 2 * 86400000) } },
      { quantity: 5, pedido: { createdAt: new Date(agora.getTime()) } },
    ]
    mockPrisma.$transaction.mockResolvedValue([10, 25, 8, 3, [], [], pedidosRecentes])

    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "token" }))
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.vendasPorDia).toBeInstanceOf(Array)
    expect(body.vendasPorDia).toHaveLength(7)

    const diasComVenda = body.vendasPorDia.filter((d) => d.total > 0)
    expect(diasComVenda.length).toBeGreaterThanOrEqual(1)
    expect(diasComVenda.some((d) => d.total === 4 || d.total === 5)).toBe(true)
  })

  it("retorna 500 para erro do Prisma", async () => {
    mockJwt.default.verify.mockReturnValue({ sub: "1", role: "empresa" })
    mockPrisma.$transaction.mockRejectedValue(new Error("DB connection failed"))

    const { GET } = await import("../app/api/empresa/dashboard/route.js")
    const res = await GET(makeReq({ token: "token" }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("DB connection failed")
  })
})
