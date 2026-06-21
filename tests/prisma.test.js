import { describe, it, expect, vi, beforeEach } from "vitest"

const { PrismaPg, PrismaClient } = vi.hoisted(() => ({
  PrismaPg: function MockPg() { return {} },
  PrismaClient: function MockClient({ adapter }) {
    return { adapter, $connect: vi.fn() }
  },
}))

vi.mock("@prisma/adapter-pg", () => ({ PrismaPg }))
vi.mock("../generated/prisma/client", () => ({ PrismaClient }))

describe("prisma.js module", () => {
  beforeEach(() => {
    delete globalThis.prisma
    vi.resetModules()
  })

  it("exporta prisma corretamente", async () => {
    process.env.DATABASE_URL = "postgresql://dummy"
    const mod = await import("../app/lib/prisma.js")
    expect(mod.prisma).toBeDefined()
    expect(mod.prisma.adapter).toBeDefined()
  })

  it("não atribui ao globalThis em NODE_ENV=production", async () => {
    const prevEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    process.env.DATABASE_URL = "postgresql://dummy"

    const before = globalThis.prisma
    const mod = await import("../app/lib/prisma.js")
    expect(globalThis.prisma).toBe(before)
    expect(mod.prisma).toBeDefined()

    process.env.NODE_ENV = prevEnv
  })
})
