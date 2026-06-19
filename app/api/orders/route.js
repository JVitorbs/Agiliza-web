import {
  cart,
  orders
} from "../../data/store.js"

export async function GET() {

  return Response.json(
    orders
  )

}

export async function POST() {

  try {

    if (
      cart.length === 0
    ) {

      throw new Error(
        "Carrinho vazio"
      )

    }

    const total =
      cart.reduce(
        (sum, item) =>

          sum +
          (
            item.price *
            item.quantity
          ),

        0
      )

    const order = {

      id:
        orders.length + 1,

      date:
        new Date()
          .toISOString(),

      items:
        [...cart],

      total

    }

    orders.push(order)

    cart.length = 0

    return Response.json(
      order,
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