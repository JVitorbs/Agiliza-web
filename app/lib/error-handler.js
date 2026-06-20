export function handlePrismaError(error) {
  if (error?.code === "P2003") {
    return Response.json({ error: "Sua sessão expirou. Faça login novamente." }, { status: 401 })
  }
  const status = error?.status ?? 400
  return Response.json({ error: error.message }, { status })
}
