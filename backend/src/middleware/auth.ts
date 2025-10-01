import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as _JwtPayload } from "jsonwebtoken";
import * as Config from "@/utils/config";
import { HttpError } from "@/dto";

type JwtPayload = _JwtPayload & { id?: string; [key: string]: any };

const createError = (message: string, status = 500): HttpError => {
  return new HttpError(status, message);
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return next(createError("Authorization header missing", 401));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(createError("Authorization header is not a Bearer token", 401));
  }

  const token = parts[1];

  try {
    // Obtener el secret en el momento de uso
    let secret: string;
    try {
      secret = Config.getJwtSecret();
    } catch {
      console.error("JWT secret not configured");
      return next(createError("Server configuration error", 500));
    }

    // Verificamos y anexamos el payload al request
    (req as any).user = jwt.verify(token, secret) as JwtPayload;

    return next();
  } catch (err: any) {
    if (err && err.name === "TokenExpiredError") {
      return next(createError("Token expired", 401));
    }
    return next(createError("Token invalid", 401));
  }
};

export default authenticate;
