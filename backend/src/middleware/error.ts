import { Request, Response, NextFunction } from "express";
import { HttpError } from "@/dto";

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status ?? 500;
  const response: any = { error: err.message || "Internal Server Error" };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

export default errorHandler;
