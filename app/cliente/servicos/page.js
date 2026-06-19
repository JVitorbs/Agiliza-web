"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ClienteServicosPage() {

  const router = useRouter()

  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

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

  async function schedule() {

    if (!selectedService) {
      alert("Selecione um serviço")
      return
    }

    if (!date) {
      alert("Selecione uma data")
      return
    }

    if (!time) {
      alert("Selecione um horário")
      return
    }

    const response = await fetch(
      "/api/appointments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          date,
          time
        })
      }
    )

    const data = await response.json()

    if (data.error) {
      alert(data.error)
      return
    }

    alert("Agendamento realizado")

    router.push("/cliente/agendamentos")

  }

  return (

    <main style={{ padding: 20 }}>

      <h1>
        Cliente - Serviços
      </h1>

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
              Dias disponíveis: {service.availableDays.join(", ")}
            </p>

            <p>
              Horário: {service.startTime} até {service.endTime}
            </p>

            <button onClick={() => setSelectedService(service)}>
              Selecionar serviço
            </button>

          </div>

        ))
      }

      {
        selectedService && (

          <section
            style={{
              border: "1px solid #999",
              padding: 15,
              marginTop: 20
            }}
          >

            <h2>
              Agendar: {selectedService.name}
            </h2>

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />

            <br />
            <br />

            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
            />

            <br />
            <br />

            <button onClick={schedule}>
              Confirmar Agendamento
            </button>

          </section>

        )
      }

    </main>

  )

}