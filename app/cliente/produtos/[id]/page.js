"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, Store, Minus, Plus, Package, MapPin, Truck, Building } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { useAlert } from "@/app/lib/useAlert"

const CATEGORY_ICONS = {
  agua: "💧", refrigerante: "🥤", salgadinho: "🥨",
  chocolate: "🍫", café: "☕", biscoito: "🍪",
  energético: "⚡", bala: "🍬",
}

function getIcon(name) {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (name.toLowerCase().includes(key)) return icon
  }
  return "📦"
}

function simulateFreight(empresaEndereco, userEndereco) {
  if (!empresaEndereco || !userEndereco) return null
  if (userEndereco.street === "A preencher") return null

  const sameState = empresaEndereco.state === userEndereco.state
  const sameCity = empresaEndereco.city === userEndereco.city

  if (sameCity) {
    return { price: 0, prazo: "Hoje", label: "Retirada local" }
  }
  if (sameState) {
    return { price: 12.90, prazo: "2 a 4 dias úteis", label: "Frete estadual" }
  }
  return { price: 24.90, prazo: "7 a 15 dias úteis", label: "Frete interestadual" }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { alert, showAlert, dismissAlert } = useAlert()

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]).then(([productsData, userData]) => {
      const items = Array.isArray(productsData) ? productsData : []
      const found = items.find(p => p.id === Number(params.id))
      setProduct(found ?? null)
      setUser(userData.user ?? null)
      setLoading(false)
    })
  }, [params.id])

  async function addToCart() {
    setAdding(true)
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId: product.id, quantity }),
    })
    const data = await res.json()
    setAdding(false)
    if (data.error) { showAlert(data.error); return }
    setAdded(true)
    window.dispatchEvent(new Event("cart-updated"))
    setTimeout(() => setAdded(false), 2000)
  }

  const enderecoEmpresa = product?.empresa?.endereco
  const enderecoUser = user?.endereco
  const isDummy = enderecoUser?.street === "A preencher"
  const frete = simulateFreight(enderecoEmpresa, enderecoUser)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-6">Produto não encontrado.</p>
        <Link href="/cliente/produtos">
          <Button>Ver produtos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert variant={alert.variant} className="flex items-center justify-between">
          <AlertDescription>{alert.message}</AlertDescription>
          <button onClick={dismissAlert} className="ml-4 text-sm font-medium hover:underline shrink-0">Fechar</button>
        </Alert>
      )}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/cliente/produtos" className="hover:text-foreground transition-colors">Produtos</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted/50 text-8xl">
          {getIcon(product.name)}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            {product.empresa && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                Vendido por <span className="font-medium text-foreground">{product.empresa.name}</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-4xl font-bold text-primary">
              R$ {Number(product.price).toFixed(2)}
            </p>
            {product.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-3 rounded-xl bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4 text-muted-foreground" />
              Origem (fornecedor)
            </div>
            {enderecoEmpresa ? (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {enderecoEmpresa.street}, {enderecoEmpresa.city} — {enderecoEmpresa.state}, {enderecoEmpresa.zipCode}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Endereço não disponível</p>
            )}
          </div>

          <div className="space-y-3 rounded-xl bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Entregar em
            </div>
            {isDummy ? (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Você ainda não cadastrou seu endereço.
                </p>
                <Link href="/cliente/configuracoes">
                  <Button variant="outline" size="sm">Cadastrar endereço</Button>
                </Link>
              </div>
            ) : enderecoUser ? (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {enderecoUser.street}, {enderecoUser.city} — {enderecoUser.state}, {enderecoUser.zipCode}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
          </div>

          {frete && (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Truck className="h-4 w-4 text-primary" />
                {frete.label}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Previsão de entrega</span>
                <span className="text-sm font-medium">{frete.prazo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor do frete</span>
                <span className="text-sm font-semibold">
                  {frete.price === 0 ? "Grátis" : `R$ ${frete.price.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantidade:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-12 text-center font-semibold tabular-nums">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(q => Math.min(99, q + 1))}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={addToCart}
                disabled={adding}
              >
                {adding ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adicionando...
                  </span>
                ) : added ? (
                  <span className="flex items-center gap-2">✓ Adicionado!</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar ao carrinho
                  </span>
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Subtotal: <span className="font-semibold text-foreground">R$ {(product.price * quantity).toFixed(2)}</span>
              {frete && frete.price > 0 && (
                <span>
                  {" + "}Frete:{" "}
                  <span className="font-semibold text-foreground">R$ {(frete.price * quantity).toFixed(2)}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
