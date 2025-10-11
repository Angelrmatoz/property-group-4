import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import csurf from "csurf";
import { PORT } from "@/utils/config";

import "@/mongo";
import authRouter from "@/controllers/auth";
import propertiesRouter from "@/controllers/properties";
import usersRouter from "@/controllers/users";
import errorHandler from "@/middleware/error";

const app = express();
app.disable("x-powered-by");

// Configure CORS to allow the frontend origin and credentials when provided
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || undefined;

// If the app is behind a proxy (e.g. Render), trust first proxy so secure cookies work
if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN || true,
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(morgan("tiny"));
app.use(express.json());
// parse cookies so middleware can read httpOnly token cookies
app.use(cookieParser());

// Enable cookie-based CSRF protection by default except during tests.
// Set ENABLE_CSRF=0 to disable (helpful for automated tests / special cases).
const ENABLE_CSRF =
  process.env.ENABLE_CSRF !== "0" && process.env.NODE_ENV !== "test";
if (ENABLE_CSRF) {
  // csurf will validate state-changing requests (POST/PUT/PATCH/DELETE)
  // and issue a token via req.csrfToken(). We use cookie: true so the
  // token is stored in a cookie and can also be returned to the client
  // by the helper route below.
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Expose a convenience endpoint the frontend can call to read the
  // current CSRF token (the endpoint itself is safe; csurf does not
  // block GET requests, it only validates unsafe methods).
  app.get("/api/csrf-token", (req, res) => {
    // req.csrfToken() is provided by csurf; if it throws we return 500.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (req as any).csrfToken?.();
    if (!token)
      return res.status(500).json({ error: "Could not generate CSRF token" });
    return res.json({ csrfToken: token });
  });
}

// Servir archivos subidos en /uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Healthcheck and root route
app.get("/api/health", (_req, res) => {
  return res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});

// Provide a friendly root response so hosting platforms probing `/` get 200
app.get("/", (_req, res) => {
  // small HTML to make it easy to load in a browser
  res
    .status(200)
    .send(
      '<html><body><h1>Property Group API</h1><p>See <a href="/api/health">/api/health</a></p></body></html>'
    );
});

app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/users", usersRouter);

// Middleware de manejo de errores (último)
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
