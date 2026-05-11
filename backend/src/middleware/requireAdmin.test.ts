import { Request, Response, NextFunction } from "express";
import requireAdmin from "@/middleware/requireAdmin";

jest.mock("@/models/user", () => ({
  findById: jest.fn(),
}));

const MockUser = require("@/models/user");

function mockQueryForAdmin(result: any) {
  return {
    select: jest.fn().mockResolvedValue(result),
  };
}

function mockReq(user?: any): Request {
  return { user } as any;
}

function mockRes(): Response {
  return {} as Response;
}

describe("requireAdmin middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockRes();
    next = jest.fn();
  });

  it("returns 401 when no user on request", async () => {
    req = mockReq(undefined);
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: "Unauthorized" }),
    );
  });

  it("returns 401 when user id missing", async () => {
    req = mockReq({});
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: "Unauthorized" }),
    );
  });

  it("returns 401 when user not found in DB", async () => {
    MockUser.findById.mockReturnValue(mockQueryForAdmin(null));
    req = mockReq({ id: "507f1f77bcf86cd799439011" });
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: "Unauthorized" }),
    );
  });

  it("returns 403 when user is not admin", async () => {
    MockUser.findById.mockReturnValue(mockQueryForAdmin({ admin: false }));
    req = mockReq({ id: "507f1f77bcf86cd799439011" });
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, message: "Forbidden" }),
    );
  });

  it("calls next() when user is admin", async () => {
    MockUser.findById.mockReturnValue(mockQueryForAdmin({ admin: true }));
    req = mockReq({ id: "507f1f77bcf86cd799439011" });
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
