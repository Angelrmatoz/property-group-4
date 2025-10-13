import { Request, Response, NextFunction } from "express";
import { HttpError } from "@/dto";

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle payload too large errors explicitly
  if (err.status === 413 || (err as any).type === "entity.too.large") {
    res.status(413).json({
      error:
        "El tamaño de los archivos excede el límite permitido. Intenta subir menos imágenes o archivos más pequeños.",
    });
    return;
  }

  const status = err.status ?? 500;
  const response: any = { error: err.message || "Internal Server Error" };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    try {
      console.error(
        "[ERROR HANDLER]",
        err && (err as any).message ? (err as any).message : err
      );
      if ((err as any).code)
        console.error("[ERROR HANDLER] code:", (err as any).code);
      if (err.stack) console.error(err.stack);
    } catch {
      // ignore
    }
  }

  res.status(status).json(response);
};

export default errorHandler;
