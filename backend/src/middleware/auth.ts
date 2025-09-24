import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as _JwtPayload } from 'jsonwebtoken';
import * as Config from '@/utils/config';
import { HttpError } from '@/dto';

type JwtPayload = _JwtPayload & { id?: string; [key: string]: any };

const createError = (message: string, status = 500): HttpError => {
  return new HttpError(status, message);
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return next(createError('Authorization header missing', 401));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(createError('Authorization header is not a Bearer token', 401));
  }

  const token = parts[1];

  try {
    if (!Config.JWT_SECRET) {
      console.error('JWT_SECRET no definido');
      return next(createError('Server configuration error', 500));
    }

    // Asignamos directamente el payload verificado al request para evitar variable local redundante
    (req as any).user = jwt.verify(token, Config.JWT_SECRET) as JwtPayload;

    return next();
  } catch (err: any) {
    if (err && err.name === 'TokenExpiredError') {
      return next(createError('Token expired', 401));
    }
    return next(createError('Token invalid', 401));
  }
};

export default authenticate;
