import { Request, Response, NextFunction } from "express";
import User from "@/models/user";
import { HttpError } from "@/dto";
import authenticate from "@/middleware/auth";
import requireAdmin from "@/middleware/requireAdmin";

function sanitizeUser(u: any) {
  if (!u) return u;
  const out = u.toObject ? u.toObject() : { ...u };
  if (out._id) {
    try {
      out.id = out._id.toString();
    } catch {}
    delete out._id;
  }
  delete out.passwordHash;
  return out;
}

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const items = await User.find().select("-passwordHash").exec();
    res.json(items.map(sanitizeUser));
  } catch (err) {
    next(err as any);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const requester = (req as any).user as any;

    const u = await User.findById(id).select("-passwordHash").exec();
    if (!u) return next(new HttpError(404, "User not found"));

    const uid =
      (u._id && u._id.toString && u._id.toString()) || String(u._id);
    if (!requester) return next(new HttpError(401, "Unauthorized"));
    if (!requester.admin && requester.id !== uid) {
      return next(new HttpError(403, "Forbidden"));
    }

    res.json(sanitizeUser(u));
  } catch (err) {
    next(err as any);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as any;

    if (
      !body ||
      !body.email ||
      !body.password ||
      !body.firstName ||
      !body.lastName
    ) {
      return next(new HttpError(400, "Missing required fields"));
    }

    const usersCount = await User.countDocuments().exec();

    if (usersCount > 0) {
      const runMiddleware = (mw: any) =>
        new Promise<void>((resolve, reject) => {
          try {
            mw(req, res as any, (err: any) =>
              err ? reject(err) : resolve(),
            );
          } catch (err) {
            reject(err);
          }
        });

      await runMiddleware(authenticate);
      await runMiddleware(requireAdmin);
    }

    const existing = await User.findOne({ email: body.email }).exec();
    if (existing) return next(new HttpError(409, "User already exists"));

    const user = new User({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      admin: usersCount === 0 ? !!body.admin || true : !!body.admin,
    });

    (user as any).password = body.password;
    await user.save();
    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    next(err as any);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id).exec();
    if (!deleted) return next(new HttpError(404, "User not found"));
    res.status(204).send();
  } catch (err) {
    next(err as any);
  }
}
