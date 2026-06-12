import { describe, expect, it } from "vitest";
import { POST } from "../app/api/auth/logout/route";

describe("Logout API", () => {

  it("deve retornar sucesso no logout", async () => {

    const response = await POST();

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

  });

});