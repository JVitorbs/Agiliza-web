"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { UserPlus, Building2, Briefcase, User, Eye, EyeOff, Building } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { registerClienteSchema, registerFuncionarioSchema, registerEmpresaSchema } from "@/app/lib/validation"
import { maskCPF, maskCNPJ, maskPhone } from "@/app/lib/masks"

const TABS = [
  { key: "cliente", label: "Cliente", icon: User },
  { key: "funcionario", label: "Funcionário", icon: Briefcase },
  { key: "empresa", label: "Empresa", icon: Building2 },
]

const SCHEMAS = {
  cliente: registerClienteSchema,
  funcionario: registerFuncionarioSchema,
  empresa: registerEmpresaSchema,
}

const INITIALS = {
  cliente: { name: "", email: "", password: "", phone: "", cpf: "" },
  funcionario: { name: "", email: "", password: "", phone: "", cpf: "", empresaEmail: "" },
  empresa: { name: "", razaoSocial: "", cnpj: "", email: "", phone: "", password: "" },
}

export default function RegisterPage() {
  const router = useRouter()
  const [type, setType] = useState("cliente")
  const [form, setForm] = useState(INITIALS.cliente)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function switchType(newType) {
    setType(newType)
    setForm(INITIALS[newType])
    setErrors({})
  }

  function update(field, maskFn) {
    return (e) => {
      let value = maskFn ? maskFn(e.target.value) : e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function getMask(field) {
    const masks = { cpf: maskCPF, cnpj: maskCNPJ, phone: maskPhone }
    return masks[field]
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const schema = SCHEMAS[type]
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0]] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    const body = { ...form, type }
    if (body.cpf) body.cpf = body.cpf.replace(/\D/g, "")
    if (body.cnpj) body.cnpj = body.cnpj.replace(/\D/g, "")
    if (body.phone) body.phone = body.phone.replace(/\D/g, "")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      toast.error(data.error)
      return
    }

    router.push("/login?registered=1")
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-xl font-extrabold text-white shadow-sm">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Criar sua conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex rounded-lg border p-1 bg-muted/50">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => switchType(tab.key)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      type === tab.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <CardTitle className="text-base mt-4">
              {type === "cliente" && "Cadastro de Cliente"}
              {type === "funcionario" && "Cadastro de Funcionário"}
              {type === "empresa" && "Cadastro de Empresa"}
            </CardTitle>
            <CardDescription>
              {type === "cliente" && "Preencha seus dados para comprar e agendar serviços."}
              {type === "funcionario" && "Preencha seus dados para gerenciar a plataforma."}
              {type === "empresa" && "Cadastre sua empresa para oferecer produtos e serviços."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "empresa" ? (
                <>
                  <Field label="Nome fantasia" error={errors.name}>
                    <Input placeholder="Agiliza" value={form.name} onChange={update("name")} />
                  </Field>
                  <Field label="Razão social" error={errors.razaoSocial}>
                    <Input placeholder="Agiliza Ltda" value={form.razaoSocial} onChange={update("razaoSocial")} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="CNPJ" error={errors.cnpj}>
                      <Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={update("cnpj", getMask("cnpj"))} />
                    </Field>
                    <Field label="Telefone" error={errors.phone}>
                      <Input placeholder="(11) 99999-9999" value={form.phone} onChange={update("phone", getMask("phone"))} />
                    </Field>
                  </div>
                  <Field label="Email corporativo" error={errors.email}>
                    <Input type="email" placeholder="contato@agiliza.com" value={form.email} onChange={update("email")} />
                  </Field>
                  <Field label="Senha" error={errors.password}>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={update("password")} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Nome completo" error={errors.name}>
                    <Input placeholder="João Silva" value={form.name} onChange={update("name")} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={type === "funcionario" ? "CPF" : "CPF"} error={errors.cpf}>
                      <Input placeholder="000.000.000-00" value={form.cpf} onChange={update("cpf", getMask("cpf"))} />
                    </Field>
                    <Field label="Telefone" error={errors.phone}>
                      <Input placeholder="(11) 99999-9999" value={form.phone} onChange={update("phone", getMask("phone"))} />
                    </Field>
                  </div>
                  <Field label="Email" error={errors.email}>
                    <Input type="email" placeholder="seu@email.com" value={form.email} onChange={update("email")} />
                  </Field>
                  <Field label="Senha" error={errors.password}>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={update("password")} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  {type === "funcionario" && (
                    <Field label="Email da empresa (opcional)">
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="contato@empresa.com" value={form.empresaEmail} onChange={update("empresaEmail")} />
                      </div>
                    </Field>
                  )}
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Criando conta...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {type === "empresa" ? "Cadastrar empresa" : "Criar conta"}
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
