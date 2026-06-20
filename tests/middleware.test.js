import { describe, it, expect, vi, beforeEach } from "vitest"

const mockNextResponse = vi.hoisted(() => ({
  next: vi.fn(() => new Response(null, { status: 200 })),
  redirect: vi.fn((url) => Response.json({ redirect: url?.toString() }, { status: 307 })),
}))

vi.mock("next/server", () => ({
  NextResponse: mockNextResponse,
}))

const mockJwtVerify = vi.hoisted(() => vi.fn())

vi.mock("jose", () => ({
  jwtVerify: mockJwtVerify,
}))

function mockRequest({ pathname, method = "GET", token, headers = {} }) {
  const cookie = token ? { get: () => ({ value: token }) } : { get: () => undefined }
  const baseUrl = "http://localhost"
  function makeUrlObj(p, parentParams) {
    const params = parentParams || new URLSearchParams()
    let _pathname = p
    const obj = {
      get pathname() { return _pathname },
      set pathname(v) { _pathname = v },
      searchParams: params,
      clone: () => makeUrlObj(_pathname, params),
      toString() {
        const qs = params.toString()
        return baseUrl + _pathname + (qs ? "?" + qs : "")
      },
    }
    return obj
  }
  return {
    nextUrl: makeUrlObj(pathname),
    url: baseUrl + pathname,
    cookies: cookie,
    method,
    headers: new Headers(headers),
  }
}

describe("proxy middleware", () => {
  let proxy

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import("../proxy.js")
    proxy = mod.proxy
  })

  // ─── public routes ──────────────────────────────────────────────────────

  it("passes through public GET /api/products", async () => {
    const req = mockRequest({ pathname: "/api/products", method: "GET" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
  })

  it("passes through public GET /api/services/1", async () => {
    const req = mockRequest({ pathname: "/api/services/1", method: "GET" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
  })

  it("blocks POST /api/products without token", async () => {
    const req = mockRequest({ pathname: "/api/products", method: "POST" })
    const res = await proxy(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Não autenticado")
  })

  it("passes through public page /cliente/produtos", async () => {
    const req = mockRequest({ pathname: "/cliente/produtos" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
  })

  it("passes through public page /cliente/servicos/1", async () => {
    const req = mockRequest({ pathname: "/cliente/servicos/1" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
  })

  it("passes through non-matching route", async () => {
    const req = mockRequest({ pathname: "/login" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
  })

  // ─── no token ───────────────────────────────────────────────────────────

  it("returns 401 for API route without token", async () => {
    const req = mockRequest({ pathname: "/api/cliente/perfil" })
    const res = await proxy(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Não autenticado")
  })

  it("redirects to login for page route without token", async () => {
    const req = mockRequest({ pathname: "/cliente/carrinho" })
    const res = await proxy(req)
    expect(res.status).toBe(307)
    const body = await res.json()
    expect(body.redirect).toContain("/login")
  })

  // ─── valid token ────────────────────────────────────────────────────────

  it("sets user headers on valid token for cliente route", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 1, email: "c@c.com", name: "Cliente", role: "cliente" },
    })
    const req = mockRequest({ pathname: "/api/cliente/perfil", token: "valid-token" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
    const { request } = mockNextResponse.next.mock.calls[0][0]
    expect(request.headers.get("x-user-id")).toBe("1")
    expect(request.headers.get("x-user-role")).toBe("cliente")
  })

  it("passes funcionario to employee route", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 2, email: "f@e.com", name: "Func", role: "funcionario", empresaId: 5 },
    })
    const req = mockRequest({ pathname: "/funcionario", token: "emp-token" })
    const res = await proxy(req)
    expect(mockNextResponse.next).toHaveBeenCalled()
    const { request } = mockNextResponse.next.mock.calls[0][0]
    expect(request.headers.get("x-user-empresa-id")).toBe("5")
  })

  it("blocks cliente on employee route API", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 1, email: "c@c.com", name: "Cliente", role: "cliente" },
    })
    const req = mockRequest({ pathname: "/api/services", method: "POST", token: "client-token" })
    const res = await proxy(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe("Acesso negado")
  })

  it("redirects cliente on employee page route", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: 1, email: "c@c.com", name: "Cliente", role: "cliente" },
    })
    const req = mockRequest({ pathname: "/funcionario", token: "client-token" })
    const res = await proxy(req)
    expect(res.status).toBe(307)
  })

  // ─── invalid token ──────────────────────────────────────────────────────

  it("returns 401 for API route with invalid token", async () => {
    mockJwtVerify.mockRejectedValue(new Error("jwt expired"))
    const req = mockRequest({ pathname: "/api/cliente/perfil", token: "expired" })
    const res = await proxy(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Token inválido")
  })

  it("redirects to login for page route with invalid token", async () => {
    mockJwtVerify.mockRejectedValue(new Error("jwt expired"))
    const req = mockRequest({ pathname: "/cliente/carrinho", token: "expired" })
    const res = await proxy(req)
    expect(res.status).toBe(307)
    const body = await res.json()
    expect(body.redirect).toContain("/login")
  })
})
