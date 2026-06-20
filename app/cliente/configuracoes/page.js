"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Save, ArrowLeft, Search, User, Mail, Phone } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"
import { maskCEP } from "@/app/lib/masks"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [tab, setTab] = useState("perfil")
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" })
  const [address, setAddress] = useState({
    street: "", city: "", state: "", zipCode: "", country: "Brasil",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [fetchingCep, setFetchingCep] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [addressSaved, setAddressSaved] = useState(false)
  const [error, setError] = useState("")
  const cepTimer = useRef(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        const u = data.user
        if (u) {
          setProfile({ name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "" })
        }
        const end = u?.endereco
        if (end) {
          setAddress(prev => ({
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

  function updateProfile(field) {
    return (e) => setProfile(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setError("")
    setProfileSaved(false)
    setSavingProfile(true)

    const res = await fetch("/api/cliente/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, phone: profile.phone }),
    })

    const data = await res.json()
    setSavingProfile(false)

    if (data.error) { setError(data.error); return }

    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  function updateAddress(field) {
    return (e) => setAddress(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleCEP(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8)
    setAddress(prev => ({ ...prev, zipCode: maskCEP(raw) }))

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
      if (data.erro) { setError("CEP não encontrado"); return }
      setAddress(prev => ({
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

  async function handleAddressSubmit(e) {
    e.preventDefault()
    setError("")
    setAddressSaved(false)
    setSavingAddress(true)

    const body = { ...address, zipCode: address.zipCode.replace(/\D/g, "") }

    const res = await fetch("/api/cliente/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSavingAddress(false)

    if (data.error) { setError(data.error); return }

    setAddress(prev => ({ ...prev, zipCode: maskCEP(data.endereco.zipCode) }))
    setAddressSaved(true)
    setTimeout(() => setAddressSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const isDummy = address.street === "A preencher" && address.city === "A preencher"

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
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seus dados pessoais e endereço de entrega.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="perfil">Dados pessoais</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Dados pessoais</CardTitle>
                </div>
                <CardDescription>
                  Seu nome e telefone aparecem para as empresas quando você faz um pedido ou agendamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={profile.name} onChange={updateProfile("name")} placeholder="Seu nome" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={profile.phone} onChange={updateProfile("phone")} placeholder="(11) 99999-9999" />
                </div>
              </CardContent>
            </Card>

            {profileSaved && (
              <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                Dados salvos com sucesso!
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar dados
                  </span>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="endereco">
          <form onSubmit={handleAddressSubmit} className="space-y-6">
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
                    Você ainda não cadastrou seu endereço. É obrigatório para finalizar compras e agendar serviços.
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      value={address.zipCode}
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
                  <Label htmlFor="street">Logradouro</Label>
                  <Input id="street" value={address.street} onChange={updateAddress("street")} placeholder="Rua, Av, etc" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" value={address.city} onChange={updateAddress("city")} placeholder="São Paulo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" value={address.state} onChange={updateAddress("state")} placeholder="SP" maxLength={2} className="uppercase" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" value={address.country} onChange={updateAddress("country")} placeholder="Brasil" />
                </div>
              </CardContent>
            </Card>

            {addressSaved && (
              <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                Endereço salvo com sucesso!
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={savingAddress || fetchingCep}>
                {savingAddress ? (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
