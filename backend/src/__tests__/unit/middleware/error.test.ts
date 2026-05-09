import { Request, Response, NextFunction } from "express";
import errorHandler from "@/middleware/error";
import { HttpError } from "@/dto/error";

function mockReq(): Request {
  return {} as Request;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorHandler middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = jest.fn();
  });

  it("responds with 500 and default message for unknown errors", () => {
    const err = new Error("Something broke");
    errorHandler(err as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Something broke",
    });
  });

  it("responds with HttpError status and message", () => {
    const err = new HttpError(404, "Not found");
    errorHandler(err as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("responds with 413 for payload too large", () => {
    const err = new Error("Request entity too large");
    (err as any).type = "entity.too.large";
    errorHandler(err as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "El tamaño de los archivos excede el límite permitido. Intenta subir menos imágenes o archivos más pequeños.",
    });
  });

  it("responds with 413 when status is 413", () => {
    const err = new HttpError(413, "Payload too large");
    errorHandler(err as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "El tamaño de los archivos excede el límite permitido. Intenta subir menos imágenes o archivos más pequeños.",
    });
  });

  it("responds with 400 for multer file type errors", () => {
    const err = new Error("Tipo de archivo no válido. Solo se permiten imágenes.");
    (err as any).code = "LIMIT_FILE_TYPE";
    errorHandler(err as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Tipo de archivo no válido. Solo se permiten imágenes.",
    });
  });

  it("includes stack trace in development mode", () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const err = new HttpError(400, "Bad request");
    err.stack = "Error: Bad request\n    at Test";
    errorHandler(err as any, req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Bad request",
        stack: "Error: Bad request\n    at Test",
      }),
    );
    process.env.NODE_ENV = origEnv;
  });
});
