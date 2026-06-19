"use client"

import { useEffect, useState } from "react"

export default function CartPage() {

  const [items, setItems] = useState([])

  async function loadCart() {

    const response =
      await fetch("/api/cart")

    const data =
      await response.json()

    setItems(data)

  }

  useEffect(() => {

    loadCart()

  }, [])

  async function removeItem(id) {

    const response =
      await fetch(
        "/api/cart",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            id
          })
        }
      )

    const data =
      await response.json()

    if (data.error) {

      alert(data.error)

      return

    }

    await loadCart()

  }

  async function finishOrder() {

    const response =
      await fetch(
        "/api/orders",
        {
          method: "POST"
        }
      )

    const data =
      await response.json()

    if (data.error) {

      alert(data.error)

      return

    }

    alert(
      `Pedido #${data.id} criado com sucesso`
    )

    await loadCart()

  }

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        (
          item.price *
          item.quantity
        ),
      0
    )

  return (

    <main
      style={{
        padding: 20,
        maxWidth: "900px",
        margin: "0 auto"
      }}
    >

      <h1>
        Carrinho de Compras
      </h1>

      {items.length === 0 && (

        <p>
          Carrinho vazio
        </p>

      )}

      {items.map(item => (

        <div
          key={item.id}
          style={{
            border:
              "1px solid #ccc",
            padding: 15,
            marginBottom: 15,
            borderRadius: 8
          }}
        >

          <h3>
            {item.name}
          </h3>

          <p>
            Quantidade:
            {" "}
            {item.quantity}
          </p>

          <p>
            Preço:
            {" "}
            R$
            {" "}
            {Number(
              item.price
            ).toFixed(2)}
          </p>

          <p>
            Subtotal:
            {" "}
            R$
            {" "}
            {(
              item.price *
              item.quantity
            ).toFixed(2)}
          </p>

          <button
            onClick={() =>
              removeItem(
                item.id
              )
            }
          >
            Remover
          </button>

        </div>

      ))}

      <hr />

      <h2>
        Total:
        {" "}
        R$
        {" "}
        {total.toFixed(2)}
      </h2>

      <button
        onClick={finishOrder}
        disabled={
          items.length === 0
        }
      >
        Finalizar Compra
      </button>

    </main>

  )

}