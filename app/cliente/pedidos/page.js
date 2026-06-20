"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ShoppingBag } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"

const STATUS_LABELS = { FINALIZADO: "Finalizado", ABERTO: "Aberto", CANCELADO: "Cancelado" }
const STATUS_VARIANT = { FINALIZADO: "success", ABERTO: "warning", CANCELADO: "destructive" }

export default function PedidosPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} pedido{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/cliente/produtos">
          <Button variant="ghost" size="sm">
            <ShoppingBag className="mr-1.5 h-4 w-4" />
            Continuar comprando
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">Você ainda não fez pedidos.</p>
          <Link href="/cliente/produtos">
            <Button>Ir à loja</Button>
          </Link>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-lg">Pedido #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {order.invoiceNumber && ` · NF: ${order.invoiceNumber}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                    <span className="text-lg font-bold text-primary">
                      R$ {Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="flex flex-wrap gap-2">
                  {(order.items ?? []).map(item => (
                    <Badge key={item.id} variant="secondary" className="text-xs">
                      {item.name} ×{item.quantity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
