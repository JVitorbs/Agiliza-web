"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, Store, Scissors, AlertTriangle, MapPin, Building } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"

const WEEK_LABELS = {
  segunda: "Seg", terca: "Ter", quarta: "Qua",
  quinta: "Qui", sexta: "Sex", sabado: "Sáb", domingo: "Dom",
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addressOk, setAddressOk] = useState(true)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        const end = data.user?.endereco
        setAddressOk(end && end.street !== "A preencher")
      })
      .catch(() => setAddressOk(false))
    fetch("/api/services")
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : []
        const found = items.find(s => s.id === Number(params.id))
        setService(found ?? null)
        setLoading(false)
      })
  }, [params.id])

  async function schedule() {
    if (!date || !time) { alert("Selecione data e horário"); return }
    setScheduling(true)
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: service.id, serviceName: service.name, date, time }),
    })
    const data = await res.json()
    setScheduling(false)
    if (data.error) { alert(data.error); return }
    window.dispatchEvent(new Event("cart-updated"))
    router.push("/cliente/agendamentos")
  }

  const today = new Date().toISOString().split("T")[0]

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-6">Serviço não encontrado.</p>
        <Link href="/cliente/servicos"><Button>Ver serviços</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/cliente/servicos" className="hover:text-foreground transition-colors">Serviços</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{service.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted/50">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/20">
            <Scissors className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">Serviço</Badge>
            <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
            {service.empresa && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                Oferecido por <span className="font-medium text-foreground">{service.empresa.name}</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-4xl font-bold text-primary">R$ {Number(service.price).toFixed(2)}</p>
            {service.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{service.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {(service.availableDays ?? []).map(d => (
                <Badge key={d} variant="secondary">{WEEK_LABELS[d] ?? d}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {service.startTime} – {service.endTime}
            </div>
          </div>

          <Separator />

          {service.empresa?.endereco && (
            <div className="space-y-3 rounded-xl bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4 text-muted-foreground" />
                Local do serviço
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {service.empresa.endereco.street}, {service.empresa.endereco.city} — {service.empresa.endereco.state}, {service.empresa.endereco.zipCode}
                </span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4 rounded-xl border border-border p-5">
            <h3 className="font-semibold">Agendar horário</h3>
            {!addressOk && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <span>Cadastre um endereço antes de agendar.</span>
                  <Link href="/cliente/configuracoes">
                    <Button variant="outline" size="sm"><MapPin className="mr-1.5 h-3 w-3" />Cadastrar endereço</Button>
                  </Link>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário</label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={schedule} disabled={scheduling || !addressOk}>
              {scheduling ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Agendando...
                </span>
              ) : !addressOk ? (
                "Cadastre um endereço"
              ) : (
                "Confirmar agendamento"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
