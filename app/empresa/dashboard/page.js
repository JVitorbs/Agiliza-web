"use client"

import { useEffect, useState } from "react"
import { Users, Package, Calendar, Store, BarChart3, PieChart } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/app/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart as RechartsPie, Cell } from "recharts"

const metrics = [
  { key: "totalFuncionarios", label: "Funcionários", icon: Users, color: "text-blue-600 dark:text-blue-400", href: "/empresa/funcionarios" },
  { key: "totalProdutos", label: "Produtos", icon: Package, color: "text-emerald-600 dark:text-emerald-400", href: "/funcionario/produtos" },
  { key: "totalServicos", label: "Serviços", icon: Calendar, color: "text-purple-600 dark:text-purple-400", href: "/funcionario/servicos" },
  { key: "totalAgendamentos", label: "Agendamentos", icon: Store, color: "text-amber-600 dark:text-amber-400", href: "/cliente/agendamentos" },
]

const barConfig = {
  total: { label: "Agendamentos", color: "var(--color-chart-1)" },
}

const vendasBarConfig = {
  total: { label: "Vendas", color: "var(--color-chart-2)" },
}

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

export default function EmpresaDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/empresa/dashboard")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) { toast.error(body.error); return }
        setData(body)
      })
      .catch(() => toast.error("Erro ao carregar dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  const pieConfig = Object.fromEntries(
    (data.agendamentosPorServico || []).map((item, i) => [
      item.servico,
      { label: item.servico, color: COLORS[i % COLORS.length] },
    ])
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da sua empresa</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon, color, href }) => (
          <a key={key} href={href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data[key]}</div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.agendamentosPorDia?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Agendamentos por Dia (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barConfig} className="aspect-auto h-[250px]">
                <BarChart data={data.agendamentosPorDia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dia" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {data.agendamentosPorServico?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                Agendamentos por Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="aspect-auto h-[250px]">
                <RechartsPie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={data.agendamentosPorServico}
                    dataKey="total"
                    nameKey="servico"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data.agendamentosPorServico.map((entry, i) => (
                      <Cell key={entry.servico} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </RechartsPie>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {data.vendasPorDia?.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Produtos Vendidos por Dia (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={vendasBarConfig} className="aspect-auto h-[250px]">
                <BarChart data={data.vendasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dia" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
