import { describe, it, expect } from "vitest"

// ─── validation ──────────────────────────────────────────────────────────────
import {
  registerClienteSchema,
  registerFuncionarioSchema,
  registerEmpresaSchema,
  loginSchema,
} from "../app/lib/validation.js"

function validationErrors(schema, data) {
  const result = schema.safeParse(data)
  if (result.success) return []
  return result.error.issues.map(err => err.message)
}

describe("validation — registerClienteSchema", () => {
  const valid = {
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
    cpf: "529.982.247-25",
    phone: "(11) 99999-9999",
  }

  it("aceita dados válidos", () => {
    expect(() => registerClienteSchema.parse(valid)).not.toThrow()
  })

  it("rejeita nome curto", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, name: "Jo" })
    expect(errs).toContain("Nome deve ter no mínimo 3 caracteres")
  })

  it("rejeita email inválido", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, email: "invalido" })
    expect(errs).toContain("Email inválido")
  })

  it("rejeita CPF inválido — dígito errado", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, cpf: "529.982.247-26" })
    expect(errs).toContain("CPF inválido")
  })

  it("rejeita CPF inválido — todos iguais", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, cpf: "111.111.111-11" })
    expect(errs).toContain("CPF inválido")
  })

  it("rejeita CPF inválido — caracteres não numéricos", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, cpf: "abc" })
    expect(errs).toContain("CPF inválido")
  })

  it("rejeita password curta", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, password: "12345" })
    expect(errs).toContain("Senha deve ter no mínimo 6 caracteres")
  })

  it("rejeita telefone com menos de 10 dígitos", () => {
    const errs = validationErrors(registerClienteSchema, { ...valid, phone: "(11) 9999" })
    expect(errs).toContain("Telefone inválido")
  })
})

describe("validation — registerFuncionarioSchema", () => {
  const valid = {
    name: "Maria Souza",
    email: "maria@empresa.com",
    password: "654321",
    cpf: "529.982.247-25",
    phone: "(11) 99999-9999",
  }

  it("aceita dados válidos", () => {
    expect(() => registerFuncionarioSchema.parse(valid)).not.toThrow()
  })

  it("rejeita CPF inválido", () => {
    const errs = validationErrors(registerFuncionarioSchema, { ...valid, cpf: "000.000.000-00" })
    expect(errs).toContain("CPF inválido")
  })
})

describe("validation — registerEmpresaSchema", () => {
  const valid = {
    name: "Agiliza",
    razaoSocial: "Agiliza Ltda",
    cnpj: "11.222.333/0001-81",
    email: "contato@agiliza.com",
    phone: "(11) 99999-9999",
    password: "123456",
  }

  it("aceita dados válidos", () => {
    expect(() => registerEmpresaSchema.parse(valid)).not.toThrow()
  })

  it("rejeita CNPJ inválido — dígito errado", () => {
    const errs = validationErrors(registerEmpresaSchema, { ...valid, cnpj: "11.222.333/0001-82" })
    expect(errs).toContain("CNPJ inválido")
  })

  it("rejeita CNPJ inválido — todos iguais", () => {
    const errs = validationErrors(registerEmpresaSchema, { ...valid, cnpj: "11.111.111/1111-11" })
    expect(errs).toContain("CNPJ inválido")
  })

  it("rejeita nome fantasia curto", () => {
    const errs = validationErrors(registerEmpresaSchema, { ...valid, name: "Ag" })
    expect(errs).toContain("Nome fantasia deve ter no mínimo 3 caracteres")
  })

  it("rejeita razão social curta", () => {
    const errs = validationErrors(registerEmpresaSchema, { ...valid, razaoSocial: "Ag" })
    expect(errs).toContain("Razão social deve ter no mínimo 3 caracteres")
  })
})

describe("validation — loginSchema", () => {
  it("aceita dados válidos", () => {
    expect(() => loginSchema.parse({ email: "a@b.com", password: "x" })).not.toThrow()
  })

  it("rejeita email inválido", () => {
    const errs = validationErrors(loginSchema, { email: "invalido", password: "x" })
    expect(errs).toContain("Email inválido")
  })

  it("rejeita senha vazia", () => {
    const errs = validationErrors(loginSchema, { email: "a@b.com", password: "" })
    expect(errs).toContain("Senha obrigatória")
  })
})

// ─── masks ───────────────────────────────────────────────────────────────────
import { maskCPF, maskCNPJ, maskPhone, maskCEP, applyMask } from "../app/lib/masks.js"

describe("masks — maskCPF", () => {
  it("formata CPF completo", () => {
    expect(maskCPF("52998224725")).toBe("529.982.247-25")
  })

  it("formata parcial — 3 dígitos", () => {
    expect(maskCPF("529")).toBe("529")
  })

  it("formata parcial — 6 dígitos", () => {
    expect(maskCPF("529982")).toBe("529.982")
  })

  it("formata parcial — 9 dígitos", () => {
    expect(maskCPF("529982247")).toBe("529.982.247")
  })

  it("ignora caracteres não numéricos", () => {
    expect(maskCPF("529.982.247-25")).toBe("529.982.247-25")
  })

  it("limita em 11 dígitos", () => {
    expect(maskCPF("52998224725123")).toBe("529.982.247-25")
  })

  it("retorna string vazia para vazio", () => {
    expect(maskCPF("")).toBe("")
  })
})

describe("masks — maskCNPJ", () => {
  it("formata CNPJ completo", () => {
    expect(maskCNPJ("11222333000181")).toBe("11.222.333/0001-81")
  })

  it("formata parcial — 2 dígitos", () => {
    expect(maskCNPJ("11")).toBe("11")
  })

  it("formata parcial — 5 dígitos", () => {
    expect(maskCNPJ("11222")).toBe("11.222")
  })

  it("formata parcial — 8 dígitos", () => {
    expect(maskCNPJ("11222333")).toBe("11.222.333")
  })

  it("formata parcial — 12 dígitos", () => {
    expect(maskCNPJ("112223330001")).toBe("11.222.333/0001")
  })

  it("limita em 14 dígitos", () => {
    expect(maskCNPJ("1122233300018199")).toBe("11.222.333/0001-81")
  })
})

describe("masks — maskPhone", () => {
  it("formata 11 dígitos (celular)", () => {
    expect(maskPhone("11999999999")).toBe("(11) 99999-9999")
  })

  it("formata 10 dígitos (fixo)", () => {
    expect(maskPhone("1199999999")).toBe("(11) 9999-9999")
  })

  it("não mascara com menos de 10 dígitos", () => {
    expect(maskPhone("1199")).toBe("(11) 99")
  })

  it("limita em 11 dígitos", () => {
    expect(maskPhone("11999999999123")).toBe("(11) 99999-9999")
  })
})

describe("masks — maskCEP", () => {
  it("formata CEP completo", () => {
    expect(maskCEP("01001000")).toBe("01001-000")
  })

  it("não insere hífen com menos de 5 dígitos", () => {
    expect(maskCEP("0100")).toBe("0100")
  })

  it("ainda não insere hífen com exatamente 5 dígitos", () => {
    expect(maskCEP("01001")).toBe("01001")
  })

  it("insere hífen ao digitar o 6º dígito", () => {
    expect(maskCEP("010010")).toBe("01001-0")
  })

  it("limita em 8 dígitos", () => {
    expect(maskCEP("01001000123")).toBe("01001-000")
  })
})

describe("masks — applyMask", () => {
  it("aplica maskCPF via applyMask", () => {
    expect(applyMask("52998224725", maskCPF)).toBe("529.982.247-25")
  })

  it("aplica maskCEP via applyMask", () => {
    expect(applyMask("01001000", maskCEP)).toBe("01001-000")
  })
})

// ─── error-handler ───────────────────────────────────────────────────────────
import { handlePrismaError } from "../app/lib/error-handler.js"

describe("error-handler — handlePrismaError", () => {
  it("P2003 retorna 401 com mensagem de sessão expirada", async () => {
    const error = { code: "P2003", message: "FK violation" }
    const res = handlePrismaError(error)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Sua sessão expirou. Faça login novamente.")
  })

  it("P2002 retorna 400 com a mensagem original", async () => {
    const error = { code: "P2002", message: "Unique constraint failed" }
    const res = handlePrismaError(error)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Unique constraint failed")
  })

  it("erro genérico retorna 400", async () => {
    const error = new Error("Algo deu errado")
    const res = handlePrismaError(error)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Algo deu errado")
  })

  it("erro com .status custom preserva o status", async () => {
    const error = new Error("Custom status")
    error.status = 409
    const res = handlePrismaError(error)
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe("Custom status")
  })

  it("erro sem .message retorna 400 com undefined", async () => {
    const error = { code: "UNKNOWN" }
    const res = handlePrismaError(error)
    expect(res.status).toBe(400)
  })
})

// ─── utils ───────────────────────────────────────────────────────────────────
import { cn } from "../app/lib/utils.js"

describe("utils — cn", () => {
  it("combina classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("remove classes duplicadas via twMerge", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })

  it("resolve classes condicionais", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("lida com undefined/null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
  })

  it("mescla classes conflitantes (twMerge)", () => {
    expect(cn("text-lg", "text-sm")).toBe("text-sm")
  })

  it("retorna string vazia sem argumentos", () => {
    expect(cn()).toBe("")
  })
})
