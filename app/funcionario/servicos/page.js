"use client"

import { useEffect, useState } from "react"
import { Scissors, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent } from "@/app/components/ui/card"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/app/components/ui/dialog"

const WEEK_DAYS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
const WEEK_LABELS = {
  segunda: "Seg", terca: "Ter", quarta: "Qua",
  quinta: "Qui", sexta: "Sex", sabado: "Sáb", domingo: "Dom",
}

const EMPTY_FORM = { name: "", description: "", price: "", availableDays: [], startTime: "", endTime: "" }

export default function FuncionarioServicosPage() {
  const [services, setServices] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.user?.empresa) setEmpresa(data.user.empresa)
      })
      .catch(() => {})
    loadServices()
  }, [])

  async function loadServices() {
    setLoading(true)
    const res = await fetch("/api/services")
    const data = await res.json()
    setServices(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function update(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function toggleDay(day) {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  function startNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function startEdit(service) {
    setEditingId(service.id)
    setForm({
      name: service.name,
      description: service.description ?? "",
      price: String(service.price),
      availableDays: service.availableDays ?? [],
      startTime: service.startTime ?? "",
      endTime: service.endTime ?? "",
    })
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setEditingId(null)
  }

  function getEmpresaId() {
    try {
      const user = JSON.parse(localStorage.getItem("agiliza_user"))
      return user?.empresaId
    } catch { return undefined }
  }

  async function save() {
    setSaving(true)
    const method = editingId ? "PUT" : "POST"
    const base = { ...form, price: Number(form.price) }
    const body = editingId
      ? { id: editingId, ...base }
      : { ...base, empresaId: getEmpresaId() }

    const res = await fetch("/api/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (data.error) { toast.error(data.error); return }
    handleClose()
    await loadServices()
  }

  async function handleRemove() {
    if (confirmId === null) return
    const res = await fetch("/api/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirmId }),
    })
    const data = await res.json()
    setConfirmId(null)
    if (data.error) { toast.error(data.error); return }
    await loadServices()
  }

  return (
    <div className="space-y-8">
      <Dialog open={confirmId !== null} onOpenChange={(open) => { if (!open) setConfirmId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover serviço?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="destructive" onClick={handleRemove}>
              Remover
            </Button>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {services.length} serviço{services.length !== 1 ? "s" : ""} cadastrado{services.length !== 1 ? "s" : ""}
            {empresa && (
              <span> — <span className="font-medium text-foreground">{empresa.name}</span></span>
            )}
          </p>
        </div>
        <Button onClick={startNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo serviço
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input placeholder="Nome do serviço" value={form.name} onChange={update("name")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input placeholder="Descrição opcional" value={form.description} onChange={update("description")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço (R$) *</label>
              <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.price} onChange={update("price")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dias disponíveis *</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {WEEK_DAYS.map(day => (
                  <Button
                    key={day}
                    type="button"
                    variant={form.availableDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {WEEK_LABELS[day]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Início *</label>
                <Input type="time" value={form.startTime} onChange={update("startTime")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fim *</label>
                <Input type="time" value={form.endTime} onChange={update("endTime")} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={save} disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Scissors className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">Nenhum serviço cadastrado.</p>
          <Button onClick={startNew}>Cadastrar serviço</Button>
        </div>
      )}

      {!loading && services.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Serviço</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4 hidden md:table-cell">Dias</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4 hidden md:table-cell">Horário</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">Preço</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description || "—"}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(service.availableDays ?? []).map(d => (
                          <Badge key={d} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {WEEK_LABELS[d] ?? d}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                      {service.startTime} – {service.endTime}
                    </td>
                    <td className="p-4 text-right font-semibold text-primary">
                      R$ {Number(service.price).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => startEdit(service)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setConfirmId(service.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
