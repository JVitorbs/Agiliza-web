import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "agiliza-secret-dev"
)

const EMPLOYEE_ROUTES = [
  "/funcionario",
  "/api/services",
  "/api/products",
]

const AUTH_ROUTES = [
  "/api/appointments",
  "/api/cart",
  "/api/orders",
  "/api/cliente",
  "/cliente/carrinho",
  "/cliente/pedidos",
  "/cliente/agendamentos",
]

const PUBLIC_PAGE_ROUTES = [
  "/cliente/produtos",
  "/cliente/servicos",
]

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // GET público em APIs de produtos e serviços
  const isPublicGet =
    request.method === "GET" &&
    (pathname.startsWith("/api/products") || pathname.startsWith("/api/services"))

  // Páginas públicas que não exigem login
  const isPublicPage = PUBLIC_PAGE_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"))

  if (isPublicGet || isPublicPage) {
    return NextResponse.next()
  }

  const isEmployeeRoute = EMPLOYEE_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  if (!isEmployeeRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get("agiliza_token")?.value

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (isEmployeeRoute) {
      const isEmployee = payload.role === "funcionario" || payload.role === "admin" || payload.role === "empresa"
      if (!isEmployee) {
        if (pathname.startsWith("/api/")) {
          return Response.json({ error: "Acesso negado" }, { status: 403 })
        }
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", String(payload.sub))
    requestHeaders.set("x-user-role", payload.role)
    requestHeaders.set("x-user-email", payload.email)
    if (payload.empresaId) requestHeaders.set("x-user-empresa-id", String(payload.empresaId))

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Token inválido" }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    "/cliente/:path*",
    "/funcionario/:path*",
    "/empresa/:path*",
    "/api/appointments/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/cliente/:path*",
    "/api/empresa/:path*",
    "/api/services/:path*",
    "/api/products/:path*",
  ],
}
