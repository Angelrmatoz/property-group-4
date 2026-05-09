import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import * as Config from "../config/config";
import { HttpError, LoginDTO, UserDTO } from "@/dto";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const body = req.body as LoginDTO & { rememberMe?: boolean };

  if (!body || !body.email || !body.password) {
    return next(new HttpError(400, "Missing email or password"));
  }

  try {
    const user = await User.findOne({ email: body.email });
    if (!user) return next(new HttpError(401, "Invalid credentials"));

    const isMatch = await (user as any).comparePassword(body.password);
    if (!isMatch) return next(new HttpError(401, "Invalid credentials"));

    let secret: string;
    try {
      secret = Config.getJwtSecret();
    } catch {
      return next(new HttpError(500, "Server configuration error"));
    }

    const payload = { id: user._id.toString(), email: user.email };
    const expiresIn = body.rememberMe ? "12h" : "1h";
    const token = jwt.sign(payload, secret, { expiresIn });

    const userDto: UserDTO = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      admin: user.admin,
    };

    res.status(200).json({ token, user: userDto });
  } catch (err) {
    console.error(
      "Error in /login handler:",
      err && (err as any).message ? (err as any).message : err,
    );
    return next(new HttpError(500, "Internal server error"));
  }
}
