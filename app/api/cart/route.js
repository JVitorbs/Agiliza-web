import { prisma } from "../../lib/prisma.js"
import { cart as memCart } from "../../data/store.js"
import { CartService } from "../../services/CartService.js"
import { handlePrismaError } from "../../lib/error-handler.js"

const useMemoryStore = process.env.NODE_ENV === "test"

async function getOrCreateCart(userId) {
  let carrinho = await prisma.carrinho.findFirst({
    where: { usuarioId: userId },
    include: { itens: { include: { produto: true, servico: true } } },
    orderBy: { createdAt: "desc" },
  })

  if (!carrinho) {
    carrinho = await prisma.carrinho.create({
      data: { usuarioId: userId },
      include: { itens: { include: { produto: true, servico: true } } },
    })
  }

  return carrinho
}

function formatCart(carrinho) {
  return carrinho.itens.map(item => ({
    id: item.id,
    produtoId: item.produtoId,
    servicoId: item.servicoId,
    name: item.produto?.name ?? item.servico?.name ?? "Item",
    price: item.produto?.price ?? item.servico?.price ?? 0,
    quantity: item.quantity,
  }))
}

function checkRole(req) {
  const role = req.headers.get("x-user-role")
  if (role !== "cliente") {
    return Response.json({ error: "Apenas clientes podem usar o carrinho" }, { status: 403 })
  }
}

export async function GET(req) {
  if (useMemoryStore) return Response.json(memCart)

  const blocked = checkRole(req)
  if (blocked) return blocked

  const userId = Number(req.headers.get("x-user-id"))
  if (!userId) return Response.json([])

  try {
    const carrinho = await getOrCreateCart(userId)
    return Response.json(formatCart(carrinho))
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function POST(req) {
  try {
    if (useMemoryStore) {
      const product = await req.json()
      CartService.addItem(memCart, product)
      return Response.json(memCart, { status: 201 })
    }

    const blocked = checkRole(req)
    if (blocked) return blocked

    const userId = Number(req.headers.get("x-user-id"))
    const body = await req.json()
    const { produtoId, servicoId, quantity = 1 } = body

    if (!produtoId && !servicoId) {
      return Response.json({ error: "Produto ou serviço obrigatório" }, { status: 400 })
    }

    const carrinho = await getOrCreateCart(userId)

    // Se já existe o item, incrementa quantidade
    const existingItem = carrinho.itens.find(
      i => (produtoId && i.produtoId === produtoId) || (servicoId && i.servicoId === servicoId)
    )

    if (existingItem) {
      await prisma.itens.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await prisma.itens.create({
        data: {
          carrinhoId: carrinho.id,
          produtoId: produtoId ?? null,
          servicoId: servicoId ?? null,
          quantity,
        },
      })
    }

    const updated = await getOrCreateCart(userId)
    return Response.json(formatCart(updated), { status: 201 })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function PATCH(req) {
  try {
    const blocked = checkRole(req)
    if (blocked) return blocked

    const userId = Number(req.headers.get("x-user-id"))
    const { id, quantity } = await req.json()

    if (!id || quantity == null || quantity < 1) {
      return Response.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    const item = await prisma.itens.findUnique({ where: { id } })
    if (!item) return Response.json({ error: "Item não encontrado" }, { status: 404 })

    const carrinho = await prisma.carrinho.findFirst({ where: { id: item.carrinhoId, usuarioId: userId } })
    if (!carrinho) return Response.json({ error: "Acesso negado" }, { status: 403 })

    await prisma.itens.update({ where: { id }, data: { quantity } })

    return Response.json({ success: true })
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function DELETE(req) {
  try {
    if (useMemoryStore) {
      const { id } = await req.json()
      CartService.removeItem(memCart, id)
      return Response.json({ success: true })
    }

    const userId = Number(req.headers.get("x-user-id"))
    const { id } = await req.json()

    const item = await prisma.itens.findUnique({ where: { id } })

    if (!item) throw new Error("Item não encontrado")

    // Verifica se o item pertence ao carrinho do usuário
    const carrinho = await prisma.carrinho.findFirst({ where: { id: item.carrinhoId, usuarioId: userId } })
    if (!carrinho) throw new Error("Acesso negado")

    await prisma.itens.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (error) {
    return handlePrismaError(error)
  }
}
