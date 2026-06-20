import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  const enderecoFuncionario = await prisma.endereco.create({
    data: {
      street: "Rua Principal, 100",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001-000",
      country: "Brasil",
    },
  })

  const enderecoCliente = await prisma.endereco.create({
    data: {
      street: "Av. Paulista, 500",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-000",
      country: "Brasil",
    },
  })

  const enderecoEmpresa = await prisma.endereco.create({
    data: {
      street: "Rua Central, 200",
      city: "São Paulo",
      state: "SP",
      zipCode: "01002-000",
      country: "Brasil",
    },
  })

  const hash = await bcrypt.hash("123456", 10)

  const empresa = await prisma.empresa.create({
    data: {
      name: "Agiliza",
      razaoSocial: "Agiliza Ltda",
      cnpj: "11222333000181",
      email: "contato@agiliza.com",
      phone: "(11) 3000-0000",
      password: hash,
      enderecoId: enderecoEmpresa.id,
    },
  })

  const funcionario = await prisma.funcionario.create({
    data: {
      name: "Funcionário Agiliza",
      email: "funcionario@agiliza.com",
      password: hash,
      phone: "(11) 99999-0001",
      cpf: "111.111.111-11",
      isManager: true,
      empresaId: empresa.id,
      enderecoId: enderecoFuncionario.id,
    },
  })

  const cliente = await prisma.usuario.create({
    data: {
      name: "Cliente Agiliza",
      email: "cliente@agiliza.com",
      password: hash,
      phone: "(11) 99999-0002",
      cpf: "222.222.222-22",
      enderecoId: enderecoCliente.id,
    },
  })

  await prisma.carrinho.create({
    data: { usuarioId: cliente.id },
  })

  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        name: "Água Mineral", description: "Garrafa 500ml — pura e refrescante", price: 3.50, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Refrigerante Cola", description: "Lata 350ml — geladinho na medida certa", price: 5.00, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Salgadinho de Queijo", description: "Pacote 100g — crocante e saboroso", price: 7.50, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Chocolate ao Leite", description: "Barra 90g — cremoso e irresistível", price: 8.90, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Café Premium", description: "Grãos selecionados — pacote 250g", price: 12.00, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Biscoito Integral", description: "Pacote 200g — saudável e prático", price: 4.50, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Energético", description: "Lata 250ml — para o pique total", price: 9.00, empresaId: empresa.id,
      },
    }),
    prisma.produto.create({
      data: {
        name: "Bala de Hortelã", description: "Pote 50g — frescor que dura", price: 2.50, empresaId: empresa.id,
      },
    }),
  ])

  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        name: "Corte Masculino", description: "Corte estilizado com máquina e tesoura", price: 35.00,
        availableDays: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"],
        startTime: "08:00", endTime: "18:00", empresaId: empresa.id,
      },
    }),
    prisma.servico.create({
      data: {
        name: "Manicure", description: "Higienização e esmaltação completa", price: 25.00,
        availableDays: ["segunda", "terca", "quarta", "quinta", "sexta"],
        startTime: "09:00", endTime: "17:00", empresaId: empresa.id,
      },
    }),
    prisma.servico.create({
      data: {
        name: "Hidratação Capilar", description: "Tratamento profundo com queratina e óleos vegetais", price: 50.00,
        availableDays: ["terca", "quarta", "quinta", "sexta", "sabado"],
        startTime: "08:00", endTime: "16:00", empresaId: empresa.id,
      },
    }),
    prisma.servico.create({
      data: {
        name: "Barba Completa", description: "Aparação e modelagem de barba com navalha", price: 20.00,
        availableDays: ["segunda", "terca", "quarta", "quinta", "sexta"],
        startTime: "08:00", endTime: "17:00", empresaId: empresa.id,
      },
    }),
  ])

  console.log("✅ Seed concluído!")
  console.log(`  👤 Funcionário: funcionario@agiliza.com / 123456`)
  console.log(`  👤 Cliente: cliente@agiliza.com / 123456`)
  console.log(`  📦 ${produtos.length} produtos criados`)
  console.log(`  🔧 ${servicos.length} serviços criados`)
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
