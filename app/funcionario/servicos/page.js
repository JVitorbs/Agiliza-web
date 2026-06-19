"use client"

import { useEffect, useState } from "react"

const weekDays = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo"
]

export default function FuncionarioServicosPage() {

  const [services, setServices] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [availableDays, setAvailableDays] = useState([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {

    loadServices()

  }, [])

  async function loadServices() {

    const response = await fetch("/api/services")
    const data = await response.json()

    setServices(
      Array.isArray(data) ? data : []
    )

  }

  function toggleDay(day) {

    if (availableDays.includes(day)) {

      setAvailableDays(
        availableDays.filter(
          item => item !== day
        )
      )

      return

    }

    setAvailableDays([
      ...availableDays,
      day
    ])

  }

  function clearForm() {

    setEditingId(null)
    setName("")
    setDescription("")
    setPrice("")
    setAvailableDays([])
    setStartTime("")
    setEndTime("")

  }

  async function saveService() {

    const method = editingId ? "PUT" : "POST"

    const body = editingId
      ? {
          id: editingId,
          name,
          description,
          price: Number(price),
          availableDays,
          startTime,
          endTime
        }
      : {
          name,
          description,
          price: Number(price),
          availableDays,
          startTime,
          endTime
        }

    const response = await fetch(
      "/api/services",
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
        ? "Serviço atualizado"
        : "Serviço cadastrado"
    )

    clearForm()
    await loadServices()

  }

  function editService(service) {

    setEditingId(service.id)
    setName(service.name)
    setDescription(service.description ?? "")
    setPrice(String(service.price))
    setAvailableDays(service.availableDays ?? [])
    setStartTime(service.startTime ?? "")
    setEndTime(service.endTime ?? "")

  }

  async function deleteService(id) {

    const response = await fetch(
      "/api/services",
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

    alert("Serviço removido")
    await loadServices()

  }

  return (

    <main style={{ padding: 20 }}>

      <h1>
        Funcionário - Serviços
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

      <h3>
        Dias disponíveis
      </h3>

      {
        weekDays.map(day => (

          <label
            key={day}
            style={{
              display: "block",
              marginBottom: 5
            }}
          >

            <input
              type="checkbox"
              checked={availableDays.includes(day)}
              onChange={() => toggleDay(day)}
            />

            {" "}
            {day}

          </label>

        ))
      }

      <h3>
        Faixa de horário
      </h3>

      <input
        type="time"
        value={startTime}
        onChange={e => setStartTime(e.target.value)}
      />

      {" até "}

      <input
        type="time"
        value={endTime}
        onChange={e => setEndTime(e.target.value)}
      />

      <br />
      <br />

      <button onClick={saveService}>
        {
          editingId
            ? "Atualizar Serviço"
            : "Cadastrar Serviço"
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
        Serviços cadastrados
      </h2>

      {
        services.length === 0 && (
          <p>
            Nenhum serviço cadastrado.
          </p>
        )
      }

      {
        services.map(service => (

          <div
            key={service.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10
            }}
          >

            <h3>
              {service.name}
            </h3>

            <p>
              {service.description}
            </p>

            <p>
              R$ {Number(service.price).toFixed(2)}
            </p>

            <p>
              Dias: {service.availableDays.join(", ")}
            </p>

            <p>
              Horário: {service.startTime} até {service.endTime}
            </p>

            <button onClick={() => editService(service)}>
              Editar
            </button>

            <button onClick={() => deleteService(service.id)}>
              Remover
            </button>

          </div>

        ))
      }

    </main>

  )

}