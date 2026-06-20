"use client"

import { useEffect, useState } from "react"
import { Package, Plus, Pencil, Trash2 } from "lucide-react"
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

export default function FuncionarioProdutosPage() {
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: "", description: "", price: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    setLoading(true)
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function update(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function startNew() {
    setEditingId(null)
    setForm({ name: "", description: "", price: "" })
    setOpen(true)
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
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

    const res = await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (data.error) { alert(data.error); return }
    handleClose()
    await loadProducts()
  }

  async function remove(id) {
    if (!confirm("Remover produto?")) return
    const res = await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    await loadProducts()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={startNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo produto
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input placeholder="Nome do produto" value={form.name} onChange={update("name")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input placeholder="Descrição opcional" value={form.description} onChange={update("description")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço (R$) *</label>
              <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.price} onChange={update("price")} />
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

      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">Nenhum produto cadastrado.</p>
          <Button onClick={startNew}>Cadastrar produto</Button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Produto</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4 hidden sm:table-cell">Descrição</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">Preço</th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">
                      {product.description || "—"}
                    </td>
                    <td className="p-4 text-right font-semibold text-primary">
                      R$ {Number(product.price).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => startEdit(product)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(product.id)}>
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
