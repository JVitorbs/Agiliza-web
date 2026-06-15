import jwt from "jsonwebtoken";

const USERS = [
  {
    email: "admin@agiliza.com",
    password: "123456",
    role: "admin",
  },
];

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return Response.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      "agiliza-secret",
      {
        expiresIn: "1h",
      }
    );

    return Response.json({
      success: true,
      token,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}