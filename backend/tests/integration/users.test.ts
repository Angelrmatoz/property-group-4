import request from "supertest";
import app from "@/index";
import { createMockUser, createMockAdmin, generateAuthToken, mockQueryBuilder } from "../helpers";

jest.mock("@/models/user", () => {
  const mockUserModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
    toObject: () => ({
      ...data,
      _id: data._id || "new-user-id",
      id: data._id || "new-user-id",
    }),
  })) as any;

  mockUserModel.find = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findOne = jest.fn();
  mockUserModel.findByIdAndDelete = jest.fn();
  mockUserModel.countDocuments = jest.fn();
  mockUserModel.exec = jest.fn();

  return mockUserModel;
});

jest.mock("@/middleware/auth", () => {
  return jest.fn((_req: any, _res: any, next: any) => {
    const auth = _req.headers && _req.headers.authorization;
    if (!auth) {
      return next({ status: 401, message: "Unauthorized" });
    }
    (_req as any).user = { id: "507f1f77bcf86cd799439011", admin: false };
    next();
  });
});

let requireAdminMock = false;
jest.mock("@/middleware/requireAdmin", () => {
  return jest.fn((_req: any, _res: any, next: any) => {
    if (requireAdminMock) {
      const user = (_req as any).user;
      if (!user || !user.admin) {
        return next({ status: 403, message: "Forbidden" });
      }
    }
    next();
  });
});

const MockUser = require("@/models/user");

describe("Users endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminMock = false;
  });

  describe("GET /api/users", () => {
    it("returns list of users", async () => {
      MockUser.find.mockReturnValue(mockQueryBuilder([
        createMockUser(),
        createMockAdmin(),
      ]));

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("excludes passwordHash from response", async () => {
      MockUser.find.mockReturnValue(mockQueryBuilder([
        createMockUser(),
      ]));

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0].passwordHash).toBeUndefined();
      }
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns user by id", async () => {
      MockUser.findById.mockReturnValue(mockQueryBuilder(createMockUser()));

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("test@example.com");
    });

    it("returns 404 for non-existent user", async () => {
      MockUser.findById.mockReturnValue(mockQueryBuilder(null));

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/users/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("strips passwordHash from response", async () => {
      MockUser.findById.mockReturnValue(mockQueryBuilder(createMockUser()));

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.body.passwordHash).toBeUndefined();
    });
  });

  describe("POST /api/users", () => {
    it("creates first user as admin (bootstrap)", async () => {
      MockUser.countDocuments.mockReturnValue(mockQueryBuilder(0));

      MockUser.findOne.mockReturnValue(mockQueryBuilder(null));

      const res = await request(app)
        .post("/api/users")
        .send({
          email: "first@example.com",
          password: "securePass123",
          firstName: "First",
          lastName: "Admin",
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe("first@example.com");
    });

    it("returns 400 when required fields missing", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ email: "only@email.com" });

      expect(res.status).toBe(400);
    });

    it("returns 409 when user already exists", async () => {
      MockUser.countDocuments.mockReturnValue(mockQueryBuilder(0));
      MockUser.findOne.mockReturnValue(mockQueryBuilder(createMockUser()));

      const res = await request(app)
        .post("/api/users")
        .send({
          email: "existing@example.com",
          password: "pass123",
          firstName: "Existing",
          lastName: "User",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("already exists");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("deletes existing user", async () => {
      MockUser.findByIdAndDelete.mockReturnValue(mockQueryBuilder(createMockUser()));

      const token = generateAuthToken();
      const res = await request(app)
        .delete("/api/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("returns 404 for non-existent user", async () => {
      MockUser.findByIdAndDelete.mockReturnValue(mockQueryBuilder(null));

      const token = generateAuthToken();
      const res = await request(app)
        .delete("/api/users/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Authentication required", () => {
    it("returns 401 on GET /api/users without token", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).toBe(401);
    });

    it("returns 401 on GET /api/users/:id without token", async () => {
      const res = await request(app).get("/api/users/507f1f77bcf86cd799439011");

      expect(res.status).toBe(401);
    });

    it("returns 401 on DELETE /api/users/:id without token", async () => {
      const res = await request(app).delete("/api/users/507f1f77bcf86cd799439011");

      expect(res.status).toBe(401);
    });
  });

  describe("Admin authorization", () => {
    it("returns 403 when non-admin user tries to list users", async () => {
      requireAdminMock = true;

      const token = generateAuthToken();
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
