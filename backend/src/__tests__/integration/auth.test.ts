import request from "supertest";
import bcrypt from "bcrypt";
import app from "@/index";
import {
  createMockUser,
  generateAuthToken,
  TEST_USER_ID,
} from "../helpers";

jest.mock("@/models/user", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

const MockUser = require("@/models/user");

function mockFindById(result: any) {
  return {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}

describe("Auth endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("returns 400 when email missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "test123" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/email|password/i);
    });

    it("returns 400 when password missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
    });

    it("returns 401 for invalid credentials", async () => {
      MockUser.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "any" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("returns 401 when password does not match", async () => {
      const mockUser = createMockUser();
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);
      MockUser.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrong" });

      expect(res.status).toBe(401);
    });

    it("returns token and user on successful login", async () => {
      const mockUser = createMockUser();
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      MockUser.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "correct" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user.id).toBe(TEST_USER_ID);
    });

    it("returns token with 12h expiry when rememberMe is true", async () => {
      const mockUser = createMockUser();
      mockUser.comparePassword = jest.fn().mockResolvedValue(true);
      MockUser.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "correct",
          rememberMe: true,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("returns user data with valid token", async () => {
      const mockUser = createMockUser();

      MockUser.findById
        .mockReturnValueOnce(mockFindById({ admin: false }))
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue(mockUser),
        });

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("returns 401 with expired token", async () => {
      const jwt = require("jsonwebtoken");
      const expiredToken = jwt.sign(
        { id: TEST_USER_ID, email: "test@example.com" },
        process.env.JWT_SECRET || "test-jwt-secret-for-testing-only",
        { expiresIn: "0s" },
      );
      await new Promise((r) => setTimeout(r, 50));

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Token expired");
    });
  });

  describe("GET /api/auth", () => {
    it("returns auth root message", async () => {
      const res = await request(app).get("/api/auth");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Authentication root");
    });
  });
});
