"use client"

import { useEffect, useState } from "react"

export default function ClienteProdutosPage() {

  const [products, setProducts] = useState([])

  useEffect(() => {

    loadProducts()

  }, [])

  async function loadProducts() {

    const response = await fetch("/api/products")
    const data = await response.json()

    setProducts(
      Array.isArray(data) ? data : []
    )

  }

  async function addToCart(product) {

    const response = await fetch(
      "/api/cart",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      }
    )

    const data = await response.json()

    if (data.error) {
      alert(data.error)
      return
    }

    alert("Produto adicionado ao carrinho")

  }

  return (

    <main style={{ padding: 20 }}>

      <h1>
        Cliente - Produtos
      </h1>

      {
        products.length === 0 && (
          <p>
            Nenhum produto cadastrado.
          </p>
        )
      }

      {
        products.map(product => (

          <div
            key={product.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10
            }}
          >

            <h3>
              {product.name}
            </h3>

            <p>
              {product.description}
            </p>

            <p>
              R$ {Number(product.price).toFixed(2)}
            </p>

            <button onClick={() => addToCart(product)}>
              Adicionar ao carrinho
            </button>

          </div>

        ))
      }

    </main>

  )

}