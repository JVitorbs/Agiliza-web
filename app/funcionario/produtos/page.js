"use client"

import { useEffect, useState } from "react"

export default function FuncionarioProdutosPage() {

  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")

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

  function clearForm() {

    setEditingId(null)
    setName("")
    setDescription("")
    setPrice("")

  }

  async function saveProduct() {

    const method = editingId ? "PUT" : "POST"

    const body = editingId
      ? {
          id: editingId,
          name,
          description,
          price: Number(price)
        }
      : {
          name,
          description,
          price: Number(price)
        }

    const response = await fetch(
      "/api/products",
      {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    if (data.error) {
      alert(data.error)
      return
    }

    alert(
      editingId
        ? "Produto atualizado"
        : "Produto cadastrado"
    )

    clearForm()
    await loadProducts()

  }

  function editProduct(product) {

    setEditingId(product.id)
    setName(product.name)
    setDescription(product.description ?? "")
    setPrice(String(product.price))

  }

  async function deleteProduct(id) {

    const response = await fetch(
      "/api/products",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      }
    )

    const data = await response.json()

    if (data.error) {
      alert(data.error)
      return
    }

    alert("Produto removido")
    await loadProducts()

  }

  return (

    <main style={{ padding: 20 }}>

      <h1>
        Funcionário - Produtos
      </h1>

      <input
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Descrição"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Preço"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <br />
      <br />

      <button onClick={saveProduct}>
        {
          editingId
            ? "Atualizar Produto"
            : "Cadastrar Produto"
        }
      </button>

      {
        editingId && (
          <button onClick={clearForm}>
            Cancelar edição
          </button>
        )
      }

      <hr />

      <h2>
        Produtos cadastrados
      </h2>

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

            <button onClick={() => editProduct(product)}>
              Editar
            </button>

            <button onClick={() => deleteProduct(product.id)}>
              Remover
            </button>

          </div>

        ))
      }

    </main>

  )

}