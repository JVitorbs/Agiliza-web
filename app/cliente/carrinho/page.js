"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, Trash2, ArrowLeft, Minus, Plus, MapPin, AlertTriangle } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Separator } from "@/app/components/ui/separator"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { useAlert } from "@/app/lib/useAlert"

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [address, setAddress] = useState(null)
  const { alert, showAlert, dismissAlert } = useAlert()

  async function loadData() {
    setLoading(true)
    const [cartRes, meRes] = await Promise.all([
      fetch("/api/cart"),
      fetch("/api/auth/me"),
    ])
    const cartData = await cartRes.json()
    setItems(Array.isArray(cartData) ? cartData : cartData.itens ?? [])

    const meData = await meRes.json()
    if (meData.user?.endereco) {
      setAddress(meData.user.endereco)
    }
    setLoading(false)
  }

  useEffect(() => { queueMicrotask(loadData) }, [])

  function removeItem(id) {
    const backup = items
    setItems(prev => prev.filter(i => i.id !== id))
    fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then(r => r.json()).then(data => {
      if (data.error) { setItems(backup); showAlert(data.error); return }
      window.dispatchEvent(new Event("cart-updated"))
    }).catch(() => setItems(backup))
  }

  function updateQuantity(id, delta) {
    const backup = items
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i))
    fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity: newQty }),
    }).then(r => r.json()).then(data => {
      if (data.error) { setItems(backup); return }
      window.dispatchEvent(new Event("cart-updated"))
    }).catch(() => setItems(backup))
  }

  async function finishOrder() {
    setFinishing(true)
    const res = await fetch("/api/orders", { method: "POST" })
    const data = await res.json()
    setFinishing(false)
    if (data.error) { showAlert(data.error); return }
    window.dispatchEvent(new Event("cart-updated"))
    setItems([])
  }

  const total = items.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0)

  const isDummy = address?.street === "A preencher" || !address

  return (
    <div className="space-y-8">
      {alert && (
        <Alert variant={alert.variant} className="flex items-center justify-between">
          <AlertDescription>{alert.message}</AlertDescription>
          <button onClick={dismissAlert} className="ml-4 text-sm font-medium hover:underline shrink-0">Fechar</button>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carrinho</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/cliente/produtos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Continuar comprando
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">Seu carrinho está vazio.</p>
          <Link href="/cliente/produtos">
            <Button>Ver produtos</Button>
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {Number(item.price).toFixed(2)} cada
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold tabular-nums text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold min-w-[5rem] text-right">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Endereço de entrega */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Endereço de entrega</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isDummy ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>Você precisa cadastrar um endereço antes de finalizar a compra.</span>
                    </div>
                    <Link href="/cliente/configuracoes">
                      <Button variant="outline" size="sm" className="w-full">
                        <MapPin className="mr-1.5 h-3 w-3" />
                        Cadastrar endereço
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">{address.street}</p>
                    <p>{address.city} — {address.state}</p>
                    <p>CEP: {address.zipCode}</p>
                    <Link href="/cliente/configuracoes" className="text-xs text-primary hover:underline mt-2 inline-block">
                      Alterar endereço
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo do pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-4">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-2"
                  size="lg"
                  onClick={finishOrder}
                  disabled={finishing || isDummy}
                >
                  {finishing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Finalizando...
                    </span>
                  ) : isDummy ? (
                    "Cadastre um endereço"
                  ) : (
                    "Finalizar compra"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
