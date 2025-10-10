import { Request, Response, NextFunction } from "express";
import User from "@/models/user";
import { HttpError } from "@/dto";

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

export default requireAdmin;
