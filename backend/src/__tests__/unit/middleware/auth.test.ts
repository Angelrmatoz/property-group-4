import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authenticate from "@/middleware/auth";
import { HttpError } from "@/dto/error";

jest.mock("@/models/user", () => ({
  findById: jest.fn(),
}));

const MockUser = require("@/models/user");

function mockReq(headers: Record<string, string> = {}): Request {
  return { headers } as Request;
}

function mockRes(): Response {
  return {} as Response;
}

describe("authenticate middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockRes();
    next = jest.fn();
  });

  it("returns 401 when no token provided", async () => {
    req = mockReq({});
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Authorization token missing",
      }),
    );
  });

  it("returns 401 when token has wrong format", async () => {
    req = mockReq({ authorization: "InvalidToken" });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 }),
    );
  });

  it("returns 401 when token is expired", async () => {
    const expiredToken = jwt.sign(
      { id: "123", email: "test@test.com" },
      process.env.JWT_SECRET || "test-jwt-secret-for-testing-only",
      { expiresIn: "0s" },
    );
    await new Promise((r) => setTimeout(r, 50));
    req = mockReq({ authorization: `Bearer ${expiredToken}` });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Token expired",
      }),
    );
  });

  it("returns 401 when user not found in DB", async () => {
    MockUser.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      }),
    });

    const validToken = jwt.sign(
      { id: "nonexistent" },
      process.env.JWT_SECRET || "test-jwt-secret-for-testing-only",
      { expiresIn: "1h" },
    );
    req = mockReq({ authorization: `Bearer ${validToken}` });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: "Unauthorized" }),
    );
  });

  it("calls next() when token is valid and user exists", async () => {
    MockUser.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ admin: false }),
        }),
      }),
    });

    const validToken = jwt.sign(
      { id: "507f1f77bcf86cd799439011" },
      process.env.JWT_SECRET || "test-jwt-secret-for-testing-only",
      { expiresIn: "1h" },
    );
    req = mockReq({ authorization: `Bearer ${validToken}` });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect((req as any).user).toBeDefined();
    expect((req as any).user.admin).toBe(false);
  });

  it("sets admin flag on req.user", async () => {
    MockUser.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ admin: true }),
        }),
      }),
    });

    const validToken = jwt.sign(
      { id: "507f1f77bcf86cd799439011" },
      process.env.JWT_SECRET || "test-jwt-secret-for-testing-only",
      { expiresIn: "1h" },
    );
    req = mockReq({ authorization: `Bearer ${validToken}` });
    await authenticate(req, res, next);
    expect((req as any).user.admin).toBe(true);
  });
});
