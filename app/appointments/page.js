"use client"

import { useState } from "react"

import {
  AppointmentService
} from "../services/AppointmentService.js"

export default function AppointmentsPage() {

  const [servicoId, setServicoId] =
    useState("")

  const [scheduledAt, setScheduledAt] =
    useState("")

  const [appointments, setAppointments] =
    useState([])

  const [message, setMessage] =
    useState("")

  async function handleSubmit(event) {

    event.preventDefault()

    try {

      const newAppointment = {

        servicoId:
          Number(servicoId),

        scheduledAt

      }

      AppointmentService
        .validateAppointment(
          appointments,
          newAppointment
        )

      const response =
        await fetch(
          "/api/appointments",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
              newAppointment
            )

          }
        )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.error
        )

      }

      setAppointments([

        ...appointments,
        newAppointment

      ])

      setMessage(
        "Agendamento realizado!"
      )

      setServicoId("")
      setScheduledAt("")

    } catch (error) {

      setMessage(
        error.message
      )

    }

  }

  async function loadAppointments() {

    try {

      const response =
        await fetch(
          "/api/appointments"
        )

      const data =
        await response.json()

      setAppointments(data)

    } catch (error) {

      setMessage(
        "Erro ao carregar agendamentos"
      )

    }

  }

  return (

    <div
      style={{
        padding: 20,
        fontFamily: "Arial"
      }}
    >

      <h1>
        Sistema de Agendamento
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 350
        }}
      >

        <input
          type="number"
          placeholder="ID do Serviço"
          value={servicoId || ""}
          onChange={event =>

            setServicoId(
              event.target.value
            )

          }
          style={{
            padding: 10
          }}
        />

        <input
          type="datetime-local"
          step="60"
          min={
            new Date()
              .toISOString()
              .slice(0, 16)
          }
          value={scheduledAt || ""}
          onChange={event =>

            setScheduledAt(
              event.target.value
            )

          }
          style={{
            padding: 10
          }}
        />

        <button
          type="submit"
          style={{
            padding: 10,
            cursor: "pointer"
          }}
        >

          Agendar

        </button>

        <button
          type="button"
          onClick={loadAppointments}
          style={{
            padding: 10,
            cursor: "pointer"
          }}
        >

          Atualizar Lista

        </button>

      </form>

      {
        message && (

          <p
            style={{
              marginTop: 20,
              fontWeight: "bold"
            }}
          >

            {message}

          </p>

        )
      }

      <hr
        style={{
          margin: "20px 0"
        }}
      />

      <h2>
        Agendamentos
      </h2>

      {
        appointments.length === 0

        ? (

          <p>
            Nenhum agendamento.
          </p>

        )

        : (

          <ul>

            {
              appointments.map(

                (
                  appointment,
                  index
                ) => (

                  <li
                    key={index}
                    style={{
                      marginBottom: 10
                    }}
                  >

                    Serviço:
                    {" "}

                    {
                      appointment
                        .servicoId
                    }

                    {" | "}

                    Data:
                    {" "}

                    {
                      appointment
                        .scheduledAt
                    }

                  </li>

                )

              )
            }

          </ul>

        )
      }

    </div>

  )

}