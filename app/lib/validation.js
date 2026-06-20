import { z } from "zod"

function isValidCPF(cpf) {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  const calc = (factors) =>
    factors.reduce((sum, factor, i) => sum + parseInt(digits[i]) * factor, 0)

  const rest1 = calc([10, 9, 8, 7, 6, 5, 4, 3, 2]) % 11
  if ((rest1 < 2 ? 0 : 11 - rest1) !== parseInt(digits[9])) return false

  const rest2 = calc([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) % 11
  if ((rest2 < 2 ? 0 : 11 - rest2) !== parseInt(digits[10])) return false

  return true
}

function isValidCNPJ(cnpj) {
  const digits = cnpj.replace(/\D/g, "")
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false

  const calc = (weight) =>
    weight.reduce((sum, w, i) => sum + parseInt(digits[i]) * w, 0)

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const rest1 = calc(w1) % 11
  if ((rest1 < 2 ? 0 : 11 - rest1) !== parseInt(digits[12])) return false

  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const rest2 = calc(w2) % 11
  if ((rest2 < 2 ? 0 : 11 - rest2) !== parseInt(digits[13])) return false

  return true
}

const phoneRefine = z.string().refine((val) => {
  const digits = val.replace(/\D/g, "")
  return digits.length >= 10 && digits.length <= 11
}, "Telefone inválido")

const passwordField = z.string().min(6, "Senha deve ter no mínimo 6 caracteres")

export const registerClienteSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: passwordField,
  cpf: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "")
    return digits.length === 11 && isValidCPF(digits)
  }, "CPF inválido"),
  phone: phoneRefine,
})

export const registerFuncionarioSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: passwordField,
  cpf: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "")
    return digits.length === 11 && isValidCPF(digits)
  }, "CPF inválido"),
  phone: phoneRefine,
})

export const registerEmpresaSchema = z.object({
  name: z.string().min(3, "Nome fantasia deve ter no mínimo 3 caracteres"),
  razaoSocial: z.string().min(3, "Razão social deve ter no mínimo 3 caracteres"),
  cnpj: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "")
    return digits.length === 14 && isValidCNPJ(digits)
  }, "CNPJ inválido"),
  email: z.string().email("Email inválido"),
  phone: phoneRefine,
  password: passwordField,
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})
