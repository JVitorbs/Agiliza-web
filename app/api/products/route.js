import { ProductService } from "../../services/ProductService.js"
import { products } from "../../data/store.js"

export async function GET() {

  return Response.json(products)

}

export async function POST(req) {

  try {

    const body = await req.json()

    ProductService.validateProduct(body)

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

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 400 }
    )

  }

}