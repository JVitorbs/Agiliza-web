"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Scissors, Store } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"

const WEEK_DAYS_LABEL = {
  segunda: "Seg", terca: "Ter", quarta: "Qua",
  quinta: "Qui", sexta: "Sex", sabado: "Sáb", domingo: "Dom",
}

export default function ClienteServicosPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(d => { setServices(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {services.length} serviço{services.length !== 1 ? "s" : ""} disponível{services.length !== 1 ? "is" : ""}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhum serviço disponível.</p>
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map(service => (
            <Link key={service.id} href={`/cliente/servicos/${service.id}`}>
              <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer">
                <div className="flex h-32 items-center justify-center bg-muted/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 text-2xl">
                    <Scissors className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <Badge variant="outline" className="w-fit mb-2 text-xs">Serviço</Badge>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description || "Sem descrição."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-lg font-bold">R$ {Number(service.price).toFixed(2)}</p>
                  {service.empresa && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Store className="h-3 w-3" />
                      {service.empresa.name}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {(service.availableDays ?? []).map(d => (
                      <Badge key={d} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {WEEK_DAYS_LABEL[d] ?? d}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {service.startTime} – {service.endTime}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
