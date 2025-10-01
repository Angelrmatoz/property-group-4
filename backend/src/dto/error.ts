// Clase HttpError reutilizable usada por middlewares y controladores
export class HttpError extends Error {
  status?: number;
  constructor(status: number, message?: string) {
    super(message || "Error");
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
