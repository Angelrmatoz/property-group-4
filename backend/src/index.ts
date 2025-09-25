import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from 'path';
import { PORT } from "@/utils/config";

import "@/mongo";
import authRouter from "@/controllers/auth";
import propertiesRouter from "@/controllers/properties";
import errorHandler from "@/middleware/error";

const app = express();

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

// Servir archivos subidos en /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);

// Middleware de manejo de errores (último)
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
