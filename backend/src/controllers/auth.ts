import { Request, Response, NextFunction } from "express";
import User from "@/models/user";
import { HttpError, UserDTO } from "@/dto";
import authenticate from "@/middleware/auth";

export function root(_req: Request, res: Response): void {
  res.status(200).json({ message: "Authentication root" });
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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

    res.status(200).json({ user: userDto });
  } catch (err) {
    console.error("Error in /me handler:", err);
    return next(new HttpError(500, "Internal server error"));
  }
}
