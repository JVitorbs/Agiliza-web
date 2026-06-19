import { ProductService } from "../../services/ProductService.js"
import { products } from "../../data/store.js"
import { prisma } from "../../lib/prisma.js"

const useMemoryStore =
  process.env.NODE_ENV === "test"

export async function GET() {

  if (useMemoryStore) {
    return Response.json(products)
  }

  const dbProducts =
    await prisma.produto.findMany({
      where: {
        active: true
      },
      orderBy: {
        id: "asc"
      }
    })

  return Response.json(dbProducts)

}

export async function POST(req) {

  try {

    const body = await req.json()

    ProductService.validateProduct(body)

    if (useMemoryStore) {

      const product = {
        id: products.length + 1,
        name: body.name,
        description: body.description,
        price: Number(body.price)
      }

      products.push(product)

      return Response.json(
        product,
        { status: 201 }
      )

    }

    const product =
      await prisma.produto.create({
        data: {
          name: body.name,
          description: body.description,
          price: Number(body.price)
        }
      })

    return Response.json(
      product,
      { status: 201 }
    )

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}

export async function PUT(req) {

  try {

    const body = await req.json()

    if (useMemoryStore) {

      const product = products.find(
        item => item.id === body.id
      )

      if (!product) {
        throw new Error("Produto não encontrado")
      }

      product.name = body.name ?? product.name
      product.description = body.description ?? product.description
      product.price =
        body.price !== undefined
          ? Number(body.price)
          : product.price

      ProductService.validateProduct(product)

      return Response.json(product)

    }

    const existingProduct =
      await prisma.produto.findUnique({
        where: {
          id: Number(body.id)
        }
      })

    if (!existingProduct) {
      throw new Error("Produto não encontrado")
    }

    const updatedProduct = {
      name: body.name ?? existingProduct.name,
      description: body.description ?? existingProduct.description,
      price:
        body.price !== undefined
          ? Number(body.price)
          : existingProduct.price
    }

    ProductService.validateProduct(updatedProduct)

    const product =
      await prisma.produto.update({
        where: {
          id: Number(body.id)
        },
        data: updatedProduct
      })

    return Response.json(product)

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}

export async function DELETE(req) {

  try {

    const body = await req.json()

    if (useMemoryStore) {

      const index = products.findIndex(
        item => item.id === body.id
      )

      if (index === -1) {
        throw new Error("Produto não encontrado")
      }

      products.splice(index, 1)

      return Response.json({
        success: true
      })

    }

    const existingProduct =
      await prisma.produto.findUnique({
        where: {
          id: Number(body.id)
        }
      })

    if (!existingProduct) {
      throw new Error("Produto não encontrado")
    }

    await prisma.produto.update({
      where: {
        id: Number(body.id)
      },
      data: {
        active: false
      }
    })

    return Response.json({
      success: true
    })

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}