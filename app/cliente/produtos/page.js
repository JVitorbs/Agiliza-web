"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Package, Store } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"

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

export default function ClienteProdutosPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function addToCart(e, product) {
    e.preventDefault()
    e.stopPropagation()
    setAdding(product.id)
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId: product.id, quantity: 1 }),
    })
    const data = await res.json()
    setAdding(null)
    if (data.error) { alert(data.error); return }
    window.dispatchEvent(new Event("cart-updated"))
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} produto{products.length !== 1 ? "s" : ""} disponível{products.length !== 1 ? "is" : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {search ? "Nenhum produto encontrado." : "Nenhum produto disponível."}
          </p>
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(product => (
            <Link key={product.id} href={`/cliente/produtos/${product.id}`}>
              <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer">
                <div className="flex h-40 items-center justify-center bg-muted/50 text-5xl">
                  {getIcon(product.name)}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description || "Sem descrição."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">R$ {Number(product.price).toFixed(2)}</span>
                    <Button
                      size="sm"
                      onClick={(e) => addToCart(e, product)}
                      disabled={adding === product.id}
                    >
                      <ShoppingCart className="mr-1.5 h-4 w-4" />
                      {adding === product.id ? "..." : "Adicionar"}
                    </Button>
                  </div>
                  {product.empresa && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Store className="h-3 w-3" />
                      {product.empresa.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
