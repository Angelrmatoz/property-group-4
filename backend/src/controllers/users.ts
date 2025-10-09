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

// DELETE /:id - eliminar un usuario por id (admin only)
// Nota: por diseño el rol 'admin' solo tiene permiso de eliminar usuarios.
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

export default usersRouter;
