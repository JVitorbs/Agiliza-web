"use client"

import {
  useEffect,
  useState
} from "react"

export default function OrdersPage() {

  const [orders, setOrders] =
    useState([])

  async function loadOrders() {

    const response =
      await fetch(
        "/api/orders"
      )

    const data =
      await response.json()

    setOrders(data)

  }

  useEffect(() => {

    loadOrders()

  }, [])

  return (

    <main
      style={{
        padding: 20
      }}
    >

      <h1>
        Histórico de Pedidos
      </h1>

      {orders.length === 0 && (

        <p>
          Nenhum pedido realizado
        </p>

      )}

      {orders.map(order => (

        <div
          key={order.id}
          style={{
            border:
              "1px solid #ccc",
            padding: 15,
            marginBottom: 15
          }}
        >

          <h3>
            Pedido #{order.id}
          </h3>

          <p>
            Data:
            {" "}
            {order.date}
          </p>

          <p>
            Total:
            {" "}
            R$
            {" "}
            {order.total.toFixed(2)}
          </p>

          <ul>

            {order.items.map(item => (

              <li
                key={
                  item.id
                }
              >

                {item.name}
                {" - "}
                Qtd:
                {" "}
                {item.quantity}

              </li>

            ))}

          </ul>

        </div>

      ))}

    </main>

  )

}