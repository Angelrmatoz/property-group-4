import { HttpError } from "@/dto/error";

describe("HttpError", () => {
  it("creates error with status and message", () => {
    const err = new HttpError(404, "Not found");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
  });

  it("uses default message when omitted", () => {
    const err = new HttpError(500);
    expect(err.message).toBe("Error");
    expect(err.status).toBe(500);
  });

  it("preserves prototype chain", () => {
    const err = new HttpError(401, "Unauthorized");
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toBeInstanceOf(Error);
  });

  it("works with instanceof checks", () => {
    const err = new HttpError(403, "Forbidden");
    expect(err instanceof HttpError).toBe(true);
  });
});
