"use client"

import { useEffect, useState } from "react"

export default function ClienteAgendamentosPage() {

  const [appointments, setAppointments] = useState([])

  useEffect(() => {

    loadAppointments()

  }, [])

  async function loadAppointments() {

    try {

      const response = await fetch("/api/appointments")
      const data = await response.json()

      setAppointments(
        Array.isArray(data) ? data : []
      )

    } catch {

      setAppointments([])

    }

  }

  return (

    <main style={{ padding: 20 }}>

      <h1>
        Cliente - Meus Agendamentos
      </h1>

      {
        appointments.length === 0 && (
          <p>
            Nenhum agendamento encontrado.
          </p>
        )
      }

      {
        appointments.map(appointment => (

          <div
            key={appointment.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10
            }}
          >

            <h3>
              {appointment.serviceName}
            </h3>

            <p>
              Data: {appointment.date}
            </p>

            <p>
              Hora: {appointment.time}
            </p>

          </div>

        ))
      }

    </main>

  )

}