import { NextResponse } from "next/server";

export function middleware(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return Response.json(
      { error: "Token não informado" },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return Response.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/appointments/:path*"],
};