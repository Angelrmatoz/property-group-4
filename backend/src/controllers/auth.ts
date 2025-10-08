import express, { Request, Response } from "express";
import User from "@/models/user";
import { HttpError, UserDTO } from "@/dto";
import authenticate from "@/middleware/auth";
import loginRouter from "@/controllers/login";

const authRouter = express.Router();

// Montar rutas de login/register (modular)
authRouter.use("/", loginRouter);

// Ruta de prueba
authRouter.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Authentication root" });
});

// Ruta protegida - obtener datos del usuario a partir del token
authRouter.get(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: any) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return next(new HttpError(401, "Unauthorized"));

      const user = await User.findById(userId).select("-passwordHash");
      if (!user) return next(new HttpError(404, "User not found"));

      const userDto: UserDTO = {
        id: user._id.toString(),
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        email: (user as any).email,
        admin: (user as any).admin,
      };

      return res.status(200).json({ user: userDto });
    } catch (err) {
      return next(new HttpError(500, "Internal server error"), err);
    }
  }
);

export default authRouter;
