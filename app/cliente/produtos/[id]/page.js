"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, Store, Minus, Plus, Package } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"

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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : []
        const found = items.find(p => p.id === Number(params.id))
        setProduct(found ?? null)
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
    if (data.error) { alert(data.error); return }
    setAdded(true)
    window.dispatchEvent(new Event("cart-updated"))
    setTimeout(() => setAdded(false), 2000)
  }

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
              Total: <span className="font-semibold text-foreground">R$ {(product.price * quantity).toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
