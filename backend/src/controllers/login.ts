import express, { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
// bcrypt removed — user registration moved to users controller
import User from "@/models/user";
import * as Config from "@/utils/config";
import { HttpError, LoginDTO, UserDTO } from "@/dto";

// auth middleware not required in this file anymore

const loginRouter = express.Router();

// Limitar intentos de autenticación para evitar bruteforce
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 requests por IP en el periodo
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// NOTE: registration endpoint removed. User creation is handled via the
// admin-only `/api/users` routes in the users controller.

// Login
loginRouter.post(
  "/login",
  authLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as LoginDTO & { rememberMe?: boolean };

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
      // Set token duration based on rememberMe preference
      const expiresIn = body.rememberMe ? "12h" : "1h";
      const token = jwt.sign(payload, secret, { expiresIn });

      const userDto: UserDTO = {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        admin: user.admin,
      };

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
