import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
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

// Servir archivos subidos en /uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

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
