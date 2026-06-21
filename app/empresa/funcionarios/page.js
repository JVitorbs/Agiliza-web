"use client"

import { useEffect, useState } from "react"
import { Users, Plus, Trash2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/app/components/ui/dialog"

export default function EmpresaFuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [vincularLoading, setVincularLoading] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  async function loadFuncionarios() {
    const res = await fetch("/api/empresa/funcionarios")
    const data = await res.json()
    setFuncionarios(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    queueMicrotask(() => { setLoading(true); loadFuncionarios() })
  }, [])

  async function handleVincular(e) {
    e.preventDefault()
    if (!email.trim()) return
    setVincularLoading(true)
    const res = await fetch("/api/empresa/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json()
    setVincularLoading(false)
    if (data.error) { toast.error(data.error); return }
    toast.success(`Funcionário ${data.name} vinculado com sucesso!`)
    setOpen(false)
    setEmail("")
    await loadFuncionarios()
  }

  async function handleDesvincular() {
    if (confirmId === null) return
    const res = await fetch("/api/empresa/funcionarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirmId }),
    })
    const data = await res.json()
    setConfirmId(null)
    if (data.error) { toast.error(data.error); return }
    toast.success("Funcionário desvinculado")
    await loadFuncionarios()
  }

  return (
    <div className="space-y-8">
      <Dialog open={confirmId !== null} onOpenChange={(open) => { if (!open) setConfirmId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular funcionário?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">O funcionário não terá mais acesso aos recursos da empresa.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="destructive" onClick={handleDesvincular}>
              Desvincular
            </Button>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {funcionarios.length} funcionário{funcionarios.length !== 1 ? "s" : ""} vinculado{funcionarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Vincular funcionário
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular funcionário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVincular} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email do funcionário</label>
              <Input
                type="email"
                placeholder="funcionario@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={vincularLoading || !email.trim()}>
                {vincularLoading ? "Vinculando..." : "Vincular"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && funcionarios.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">Nenhum funcionário vinculado.</p>
          <Button onClick={() => setOpen(true)}>Vincular funcionário</Button>
        </div>
      )}

      {!loading && funcionarios.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Nome</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4 hidden sm:table-cell">Email</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4 hidden md:table-cell">Telefone</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map(f => (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{f.name}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{f.email}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{f.phone || "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        f.active !== false
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {f.active !== false ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="destructive" size="sm" onClick={() => setConfirmId(f.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Desvincular
                      </Button>
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
