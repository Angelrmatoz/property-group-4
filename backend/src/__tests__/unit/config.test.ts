import * as Config from "@/config/config";

describe("config", () => {
  beforeEach(() => {
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret-for-testing-only";
  });

  it("getJwtSecret returns secret from env", () => {
    process.env.JWT_SECRET = "my-secret";
    const secret = Config.getJwtSecret();
    expect(secret).toBe("my-secret");
  });

  it("getJwtSecret throws when JWT_SECRET missing", () => {
    expect(() => Config.getJwtSecret()).toThrow("JWT_SECRET is not defined");
  });
});
