"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Plus } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/appointments")
      .then(r => r.json())
      .then(d => { setAppointments(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/cliente/servicos">
          <Button variant="default" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo agendamento
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">Nenhum agendamento encontrado.</p>
          <Link href="/cliente/servicos">
            <Button>Agendar serviço</Button>
          </Link>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {appointments.map(appt => (
            <Card key={appt.id}>
              <div className="flex h-24 items-center justify-center bg-muted/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 text-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base">{appt.serviceName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {appt.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(`${appt.date}T00:00:00`).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                  </div>
                )}
                {appt.time && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🕐</span>
                    {appt.time}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
