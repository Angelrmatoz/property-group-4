import request from "supertest";
import app from "@/index";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("env", "test");
  });

  it("returns 200 on root path", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Property Group API");
  });

  it("returns JSON content type for health", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
