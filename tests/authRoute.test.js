import { describe, expect, it } from "vitest";
import { POST } from "../app/api/auth/login/route";

describe("Auth API", () => {

  it("deve realizar login com credenciais válidas", async () => {

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@agiliza.com",
          password: "123456"
        })
      })
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();

  });

  it("deve rejeitar credenciais inválidas", async () => {

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@agiliza.com",
          password: "senhaErrada"
        })
      })
    );

    expect(response.status).toBe(401);

  });

});