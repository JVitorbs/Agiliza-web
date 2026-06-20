import { prisma } from "../../lib/prisma.js"
import { cart as memCart, orders as memOrders } from "../../data/store.js"
import { handlePrismaError } from "../../lib/error-handler.js"

const useMemoryStore = process.env.NODE_ENV === "test"

export async function GET(req) {
  if (useMemoryStore) return Response.json(memOrders)

  const userId = Number(req.headers.get("x-user-id"))
  if (!userId) return Response.json([])

  const pedidos = await prisma.pedido.findMany({
    where: { usuarioId: userId },
    include: { itens: true },
    orderBy: { createdAt: "desc" },
  })

  const result = pedidos.map(p => ({
    id: p.id,
    date: p.createdAt.toISOString(),
    total: p.total,
    status: p.status,
    invoiceNumber: p.invoiceNumber,
    items: p.itens.map(i => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
  }))

  return Response.json(result)
}

export async function POST(req) {
  try {
    if (useMemoryStore) {
      if (memCart.length === 0) throw new Error("Carrinho vazio")

      const total = memCart.reduce((s, i) => s + i.price * i.quantity, 0)
      const order = { id: memOrders.length + 1, date: new Date().toISOString(), items: [...memCart], total }
      memOrders.push(order)
      memCart.length = 0

      return Response.json(order, { status: 201 })
    }

    const userId = Number(req.headers.get("x-user-id"))

    const carrinho = await prisma.carrinho.findFirst({
      where: { usuarioId: userId },
      include: { itens: { include: { produto: true, servico: true } } },
      orderBy: { createdAt: "desc" },
    })

    if (!carrinho || carrinho.itens.length === 0) {
      throw new Error("Carrinho vazio")
    }

    const total = carrinho.itens.reduce((s, i) => {
      const price = i.produto?.price ?? i.servico?.price ?? 0
      return s + price * i.quantity
    }, 0)

    const invoiceNumber = `INV-${Date.now()}`

    const pedido = await prisma.pedido.create({
      data: {
        usuarioId: userId,
        total,
        status: "FINALIZADO",
        invoiceNumber,
        itens: {
          create: carrinho.itens.map(i => ({
            produtoId: i.produtoId ?? null,
            servicoId: i.servicoId ?? null,
            name: i.produto?.name ?? i.servico?.name ?? "Item",
            quantity: i.quantity,
            unitPrice: i.produto?.price ?? i.servico?.price ?? 0,
            subtotal: (i.produto?.price ?? i.servico?.price ?? 0) * i.quantity,
          })),
        },
      },
      include: { itens: true },
    })

    // Limpa o carrinho
    await prisma.itens.deleteMany({ where: { carrinhoId: carrinho.id } })

    return Response.json({
      id: pedido.id,
      date: pedido.createdAt.toISOString(),
      total: pedido.total,
      invoiceNumber: pedido.invoiceNumber,
      items: pedido.itens,
    }, { status: 201 })
  } catch (error) {
    return handlePrismaError(error)
  }
}
