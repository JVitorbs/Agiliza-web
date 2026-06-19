import { CartService } from "../../services/CartService.js"
import { cart } from "../../data/store.js"

export async function GET() {

  return Response.json(cart)

}

export async function POST(req) {

  try {

    const product =
      await req.json()

    CartService.addItem(
      cart,
      product
    )

    return Response.json(
      cart,
      {
        status: 201
      }
    )

  } catch (error) {

    return Response.json(
      {
        error:
          error.message
      },
      {
        status: 400
      }
    )

  }

}

export async function DELETE(req) {

  try {

    const body =
      await req.json()

    CartService.removeItem(
      cart,
      body.id
    )

    return Response.json({
      success: true
    })

  } catch (error) {

    return Response.json(
      {
        error:
          error.message
      },
      {
        status: 400
      }
    )

  }

}