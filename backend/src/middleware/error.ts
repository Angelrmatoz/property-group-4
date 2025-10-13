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
      // If csurf produced an EBADCSRFTOKEN, log request csrf header and cookies
      if ((err as any).code === "EBADCSRFTOKEN") {
        try {
          console.error(
            "[ERROR HANDLER] EBADCSRFTOKEN - incoming x-csrf-token:",
            _req.headers["x-csrf-token"] || _req.headers["X-CSRF-Token"]
          );
          console.error(
            "[ERROR HANDLER] EBADCSRFTOKEN - req.cookies:",
            (_req as any).cookies
          );
          console.error(
            "[ERROR HANDLER] EBADCSRFTOKEN - raw Cookie header:",
            _req.headers["cookie"] || _req.get?.("Cookie")
          );
          console.error(
            "[ERROR HANDLER] EBADCSRFTOKEN - request origin:",
            _req.headers["origin"]
          );
          console.error(
            "[ERROR HANDLER] EBADCSRFTOKEN - all request headers:",
            JSON.stringify(_req.headers, null, 2)
          );
        } catch {
          // ignore logging failures
        }
      }
      if (err.stack) console.error(err.stack);
    } catch {
      // ignore
    }
  }

  res.status(status).json(response);
};

export default errorHandler;
