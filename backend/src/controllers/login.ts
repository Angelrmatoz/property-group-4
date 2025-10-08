import express, { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@/models/user";
import * as Config from "@/utils/config";
import { HttpError, RegisterDTO, LoginDTO, UserDTO } from "@/dto";
import authenticate from "@/middleware/auth";

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
      !body.firstName ||
      !body.lastName
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
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        passwordHash,
      });

      await user.save();

      const userDto: UserDTO = {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        admin: user.admin,
      };

      return res.status(201).json({ user: userDto });
    } catch (err: any) {
      if (err && err.name === "ValidationError") {
        console.error("ValidationError in /register:", err.errors);
      } else {
        console.error(
          "Error in /register handler:",
          err && err.message ? err.message : err
        );
      }
      return next(new HttpError(500, "Internal server error"));
    }
  }
);

// Ruta protegida para que un usuario admin cree otros usuarios (pueden ser admin)
loginRouter.post(
  "/register/admin",
  authLimiter,
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    // El body puede incluir 'admin' pero sólo es válido si el requester es admin
    const body = req.body as RegisterDTO & { admin?: boolean };

    if (
      !body ||
      !body.email ||
      !body.password ||
      !body.firstName ||
      !body.lastName
    ) {
      return next(new HttpError(400, "Missing required fields"));
    }

    try {
      // Verificar que quien hace la petición es admin
      const requesterId = (req as any).user?.id;
      if (!requesterId) return next(new HttpError(401, "Unauthorized"));

      const requester = await User.findById(requesterId);
      if (!requester) return next(new HttpError(401, "Unauthorized"));
      if (!requester.admin) return next(new HttpError(403, "Forbidden"));

      const existing = await User.findOne({ email: body.email });
      if (existing) {
        return next(new HttpError(409, "User already exists"));
      }

      // Hashear la contraseña y crear el usuario con el flag admin si viene en body
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(body.password, saltRounds);

      if (!passwordHash) {
        return next(new HttpError(500, "Password hashing failed"));
      }

      const user = new User({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        passwordHash,
        admin: !!body.admin,
      });

      await user.save();

      const userDto: UserDTO = {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        admin: user.admin,
      };

      return res.status(201).json({ user: userDto });
    } catch (err: any) {
      console.error(
        "Error in /register/admin handler:",
        err && err.message ? err.message : err
      );
      return next(new HttpError(500, "Internal server error"));
    }
  }
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        admin: user.admin,
      };

      // Set cookie with token (httpOnly) so clients don't need to store it in localStorage
      const isSecure =
        process.env.NODE_ENV === "production" ||
        process.env.TRUST_PROXY === "1";
      res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/",
      });

      return res.status(200).json({ token, user: userDto });
    } catch (err) {
      console.error(
        "Error in /login handler:",
        err && (err as any).message ? (err as any).message : err
      );
      return next(new HttpError(500, "Internal server error"));
    }
  }
);

export default loginRouter;
