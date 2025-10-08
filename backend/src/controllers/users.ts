import express, { Request, Response, NextFunction } from "express";
import authenticate from "@/middleware/auth";
import User from "@/models/user";
import { HttpError } from "@/dto";

const usersRouter = express.Router();

// Middleware para verificar que el requester es admin
const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requesterId = (req as any).user?.id;
    if (!requesterId) return next(new HttpError(401, "Unauthorized"));

    const requester = await User.findById(requesterId).select("admin");
    if (!requester) return next(new HttpError(401, "Unauthorized"));
    if (!requester.admin) return next(new HttpError(403, "Forbidden"));

    return next();
  } catch (err) {
    return next(err as any);
  }
};

// GET / - listar usuarios (sin passwordHash)
usersRouter.get(
  "/",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find().select("-passwordHash").exec();
      res.json(users);
    } catch (err) {
      next(err as any);
    }
  }
);

// DELETE /:id - eliminar un usuario por id (admin only)
usersRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await User.findByIdAndDelete(id).exec();
      if (!deleted) return next(new HttpError(404, "User not found"));
      res.status(204).send();
    } catch (err) {
      next(err as any);
    }
  }
);

// PATCH /:id/promote - promover o despromover a admin (admin only)
usersRouter.patch(
  "/:id/promote",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { admin } = req.body as { admin?: boolean };
      if (typeof admin !== "boolean")
        return next(new HttpError(400, "Missing 'admin' boolean in body"));

      const user = await User.findById(id).select("-passwordHash");
      if (!user) return next(new HttpError(404, "User not found"));

      user.admin = admin;
      await user.save();

      res.json({ user });
    } catch (err) {
      next(err as any);
    }
  }
);

export default usersRouter;
