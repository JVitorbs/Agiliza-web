import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["app/**/*.js", "app/**/*.jsx"],
      exclude: [
        "node_modules",
        ".next",
        "**/*.config.*",
        "app/lib/prisma.js",
        "app/api/auth/login/route.js",
        "app/api/auth/logout/route.js",
        "app/api/cliente/perfil/route.js",
        "app/api/cliente/carrinho/route.js",
        "app/api/cliente/pedidos/route.js",
        "app/api/cliente/produtos/route.js",
        "app/api/cliente/servicos/route.js",
        "app/api/funcionario/produtos/route.js",
        "app/api/funcionario/servicos/route.js",
        "app/api/funcionario/agendamentos/route.js",
        "app/components/**",
        "app/**/layout.js",
        "app/**/page.js",
        "app/**/loading.js",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
