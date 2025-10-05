import express, { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@/models/user";
import * as Config from "@/utils/config";
import { HttpError, RegisterDTO, LoginDTO, UserDTO } from "@/dto";

const loginRouter = express.Router();

// Limitar intentos de autenticación para evitar bruteforce
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 requests por IP en el periodo
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registro de usuario
loginRouter.post(
  "/register",
  authLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as RegisterDTO;

    if (
      !body ||
      !body.email ||
      !body.password ||
      !body.nombre ||
      !body.apellido
    ) {
      return next(new HttpError(400, "Missing required fields"));
    }

    try {
      const existing = await User.findOne({ email: body.email });
      if (existing) {
        return next(new HttpError(409, "User already exists"));
      }

      // Hashear la contraseña aquí y pasar passwordHash al crear el usuario
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(body.password, saltRounds);

      if (!passwordHash) {
        return next(new HttpError(500, "Password hashing failed"));
      }

      const user = new User({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        passwordHash,
      });

      await user.save();

      const userDto: UserDTO = {
        id: user._id.toString(),
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      };

      return res.status(201).json({ user: userDto });
    } catch (err: any) {
      if (err && err.name === "ValidationError") {
        console.error("ValidationError in /register:", err.errors);
      } else {
        console.error(
          "Error in /register handler:",
          err && err.message ? err.message : err,
        );
      }
      return next(new HttpError(500, "Internal server error"));
    }
  },
);

// Login
loginRouter.post(
  "/login",
  authLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as LoginDTO;

    if (!body || !body.email || !body.password) {
      return next(new HttpError(400, "Missing email or password"));
    }

    try {
      const user = await User.findOne({ email: body.email });
      if (!user) return next(new HttpError(401, "Invalid credentials"));

      const isMatch = await (user as any).comparePassword(body.password);
      if (!isMatch) return next(new HttpError(401, "Invalid credentials"));

      // Obtener el secret de forma segura al momento de firmar
      let secret: string;
      try {
        secret = Config.getJwtSecret();
      } catch {
        return next(new HttpError(500, "Server configuration error"));
      }

      const payload = { id: user._id.toString(), email: user.email };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });

      const userDto: UserDTO = {
        id: user._id.toString(),
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      };

      return res.status(200).json({ token, user: userDto });
    } catch (err) {
      console.error(
        "Error in /login handler:",
        err && (err as any).message ? (err as any).message : err,
      );
      return next(new HttpError(500, "Internal server error"));
    }
  },
);

export default loginRouter;
