"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Package, Calendar, Store, LogOut, User, Menu, X, Settings, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"
import { Button } from "./ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { Separator } from "./ui/separator"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("agiliza_user")
    setUser(stored ? JSON.parse(stored) : null)
  }, [pathname])

  function isCliente() {
    return user?.role === "cliente"
  }

  function fetchCart() {
    if (!isCliente()) { setCartItems([]); return }
    fetch("/api/cart")
      .then(r => r.ok ? r.json() : [])
      .then(d => setCartItems(Array.isArray(d) ? d : d.itens ?? []))
      .catch(() => {})
  }

  useEffect(fetchCart, [user, pathname])

  useEffect(() => {
    function handler() {
      const stored = localStorage.getItem("agiliza_user")
      if (!stored) return
      setUser(JSON.parse(stored))
      fetchCart()
    }
    window.addEventListener("cart-updated", handler)
    return () => window.removeEventListener("cart-updated", handler)
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("agiliza_user")
    setUser(null)
    setCartItems([])
    router.push("/login")
  }

  const cartCount = cartItems.reduce((s, i) => s + (i.quantity ?? 1), 0)
  const cartTotal = cartItems.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0)

  const isEmployee = user?.role === "funcionario" || user?.role === "admin"
  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/")
      ? "text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground transition-colors"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          <Link href="/cliente/produtos" className={`px-3 py-2 text-sm rounded-lg ${isActive("/cliente/produtos")}`}>
            <Store className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Produtos
          </Link>
          <Link href="/cliente/servicos" className={`px-3 py-2 text-sm rounded-lg ${isActive("/cliente/servicos")}`}>
            <Calendar className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Serviços
          </Link>
          {user && !isEmployee && (
            <>
              <Link href="/cliente/pedidos" className={`px-3 py-2 text-sm rounded-lg ${isActive("/cliente/pedidos")}`}>
                <Package className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Pedidos
              </Link>
              <Link href="/cliente/agendamentos" className={`px-3 py-2 text-sm rounded-lg ${isActive("/cliente/agendamentos")}`}>
                <Calendar className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Agendamentos
              </Link>
            </>
          )}
          {isEmployee && (
            <>
              <Link href="/funcionario/produtos" className={`px-3 py-2 text-sm rounded-lg ${isActive("/funcionario/produtos")}`}>
                <Package className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Produtos
              </Link>
              <Link href="/funcionario/servicos" className={`px-3 py-2 text-sm rounded-lg ${isActive("/funcionario/servicos")}`}>
                <Calendar className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Serviços
              </Link>
            </>
          )}
        </nav>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              {isCliente() && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="p-3">
                      <p className="text-sm font-medium mb-2">
                        Carrinho ({cartCount} {cartCount === 1 ? "item" : "itens"})
                      </p>
                      <Separator />
                      {cartItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Vazio</p>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                          {cartItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <span className="text-lg">📦</span>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{item.name}</p>
                                <p className="text-muted-foreground">
                                  R$ {Number(item.price).toFixed(2)} ×{item.quantity}
                                </p>
                              </div>
                              <span className="font-semibold whitespace-nowrap">
                                R$ {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center pt-3 pb-2">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-base font-bold text-primary">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/cliente/carrinho" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">Ver carrinho</Button>
                        </Link>
                        <Link href="/cliente/carrinho" className="flex-1">
                          <Button size="sm" className="w-full">Finalizar</Button>
                        </Link>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <User className="h-4 w-4" />
                    {user.name ?? user.email}
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="p-2 w-48">
                    <div className="px-2 py-1.5 text-sm font-medium truncate">{user.name ?? user.email}</div>
                    <div className="px-2 pb-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                    <Separator className="my-1" />
                    {isCliente() ? (
                      <>
                        <Link href="/cliente/pedidos" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          Meus pedidos
                        </Link>
                        <Link href="/cliente/agendamentos" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Agendamentos
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/funcionario/produtos" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          Gerenciar produtos
                        </Link>
                        <Link href="/funcionario/servicos" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Gerenciar serviços
                        </Link>
                      </>
                    )}
                    <Link href="/cliente/configuracoes" className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Configurações
                    </Link>
                    <Separator className="my-1" />
                    <button type="button" onClick={logout} className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm">Cadastrar</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {isCliente() && (
            <Link href="/cliente/carrinho">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            <Link href="/cliente/produtos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/cliente/produtos")}`}>
              <Store className="inline h-4 w-4 mr-2" />Produtos
            </Link>
            <Link href="/cliente/servicos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/cliente/servicos")}`}>
              <Calendar className="inline h-4 w-4 mr-2" />Serviços
            </Link>
            {user && !isEmployee && (
              <>
                <Link href="/cliente/pedidos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/cliente/pedidos")}`}>
                  <Package className="inline h-4 w-4 mr-2" />Pedidos
                </Link>
                <Link href="/cliente/agendamentos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/cliente/agendamentos")}`}>
                  <Calendar className="inline h-4 w-4 mr-2" />Agendamentos
                </Link>
              </>
            )}
            {isEmployee && (
              <>
                <Link href="/funcionario/produtos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/funcionario/produtos")}`}>
                  <Package className="inline h-4 w-4 mr-2" />Produtos
                </Link>
                <Link href="/funcionario/servicos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/funcionario/servicos")}`}>
                  <Calendar className="inline h-4 w-4 mr-2" />Serviços
                </Link>
              </>
            )}
            {user && (
              <>
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {user.name ?? user.email}
                </div>
                {isCliente() ? (
                  <>
                    <Link href="/cliente/pedidos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/cliente/pedidos")}`}>
                      <Package className="inline h-4 w-4 mr-2" />Pedidos
                    </Link>
                    <Link href="/cliente/agendamentos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/cliente/agendamentos")}`}>
                      <Calendar className="inline h-4 w-4 mr-2" />Agendamentos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/funcionario/produtos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/funcionario/produtos")}`}>
                      <Package className="inline h-4 w-4 mr-2" />Produtos
                    </Link>
                    <Link href="/funcionario/servicos" onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 text-sm rounded-lg ${isActive("/funcionario/servicos")}`}>
                      <Calendar className="inline h-4 w-4 mr-2" />Serviços
                    </Link>
                  </>
                )}
                <Link href="/cliente/configuracoes" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground rounded-lg hover:text-foreground transition-colors">
                  <Settings className="h-4 w-4" /> Configurações
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false) }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground rounded-lg hover:text-destructive transition-colors">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Entrar</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="default" size="sm" className="w-full">Cadastrar</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
