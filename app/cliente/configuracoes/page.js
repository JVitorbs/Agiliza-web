"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Save, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { maskCEP } from "@/app/lib/masks"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    street: "", city: "", state: "", zipCode: "", country: "Brasil",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchingCep, setFetchingCep] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const cepTimer = useRef(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          return
        }
        const end = data.user?.endereco
        if (end) {
          setForm(prev => ({
            ...prev,
            street: end.street ?? "",
            city: end.city ?? "",
            state: end.state ?? "",
            zipCode: end.zipCode ?? "",
            country: end.country ?? "Brasil",
          }))
        }
      })
      .catch(() => setError("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [])

  function update(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleCEP(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8)
    setForm(prev => ({ ...prev, zipCode: maskCEP(raw) }))

    if (cepTimer.current) clearTimeout(cepTimer.current)

    if (raw.length === 8) {
      cepTimer.current = setTimeout(() => fetchAddress(raw), 600)
    }
  }

  async function fetchAddress(cep) {
    setFetchingCep(true)
    setError("")
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) {
        setError("CEP não encontrado")
        return
      }
      setForm(prev => ({
        ...prev,
        street: data.logradouro ?? prev.street,
        city: data.localidade ?? prev.city,
        state: data.uf ?? prev.state,
      }))
    } catch {
      setError("Erro ao buscar CEP")
    } finally {
      setFetchingCep(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSaved(false)
    setSaving(true)

    const body = { ...form, zipCode: form.zipCode.replace(/\D/g, "") }

    const res = await fetch("/api/cliente/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSaving(false)

    if (data.error) {
      setError(data.error)
      return
    }

    setForm(prev => ({ ...prev, zipCode: maskCEP(data.endereco.zipCode) }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const isDummy = form.street === "A preencher" && form.city === "A preencher"

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8 px-4 sm:px-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Endereço</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isDummy
            ? "Você ainda não preencheu seu endereço. É obrigatório para finalizar compras."
            : "Seu endereço de entrega"}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          Endereço salvo com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Endereço de entrega</CardTitle>
            </div>
            <CardDescription>
              {isDummy
                ? "Preencha seu endereço para poder finalizar compras e agendar serviços."
                : "Digite o CEP para preencher automaticamente."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDummy && (
              <div className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                Preencha seu endereço para poder finalizar compras e agendar serviços.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">CEP</label>
              <div className="relative">
                <Input
                  value={form.zipCode}
                  onChange={handleCEP}
                  placeholder="00000-000"
                  className="pl-9"
                />
                {fetchingCep ? (
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logradouro</label>
              <Input value={form.street} onChange={update("street")} placeholder="Rua, Av, etc" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Input value={form.city} onChange={update("city")} placeholder="São Paulo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Input value={form.state} onChange={update("state")} placeholder="SP" maxLength={2} className="uppercase" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">País</label>
              <Input value={form.country} onChange={update("country")} placeholder="Brasil" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || fetchingCep}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar endereço
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
