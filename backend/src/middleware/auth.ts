import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as _JwtPayload } from "jsonwebtoken";
import * as Config from "@/utils/config";
import User from "@/models/user";
import { HttpError } from "@/dto";

type JwtPayload = _JwtPayload & { id?: string; [key: string]: any };

const createError = (message: string, status = 500): HttpError => {
  return new HttpError(status, message);
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Accept token only in Authorization header (Bearer)
  let token: string | undefined;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === "string") {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return next(createError("Authorization token missing", 401));
  }

  try {
    // Obtener el secret en el momento de uso
    let secret: string;
    try {
      secret = Config.getJwtSecret();
    } catch {
      console.error("JWT secret not configured");
      return next(createError("Server configuration error", 500));
    }

    // Verify token and attach payload. Then fetch fresh user data from DB so
    // we can check roles (admin) reliably instead of trusting token claims.
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Attach basic payload first
    (req as any).user = { ...(payload as any) } as any;

    // Try to load the user from DB to get current admin flag and ensure the
    // user still exists. If not found, treat as unauthorized.
    try {
      if (payload && payload.id) {
        const u = await User.findById(payload.id).select("admin").lean().exec();
        if (!u) return next(createError("Unauthorized", 401));
        // ensure admin flag is present on req.user
        (req as any).user.admin = !!(u as any).admin;
      }
    } catch {
      // If DB lookup fails, don't block with 500 here; surface as unauthorized
      return next(createError("Unauthorized", 401));
    }

    return next();
  } catch (err: any) {
    if (err && err.name === "TokenExpiredError") {
      return next(createError("Token expired", 401));
    }
    return next(createError("Token invalid", 401));
  }
};

export default authenticate;
