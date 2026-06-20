import { afterEach, describe, expect, it, vi } from "vitest"

const mockCookieStore = vi.hoisted(() => ({
  set: vi.fn(),
  delete: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}))

describe("Logout API", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("deve retornar sucesso no logout", async () => {
    const { POST } = await import("../app/api/auth/logout/route.js")

    const response = await POST()

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(mockCookieStore.delete).toHaveBeenCalledWith("agiliza_token")
  })
})
