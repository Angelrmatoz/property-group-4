import express, { Request, Response, NextFunction } from "express";
import authenticate from "@/middleware/auth";
import User from "@/models/user";
import { HttpError } from "@/dto";
import requireAdmin from "@/middleware/requireAdmin";

const usersRouter = express.Router();

// Helper to strip sensitive fields
function sanitizeUser(u: any) {
  if (!u) return u;
  const out = u.toObject ? u.toObject() : { ...u };
  // normalize id for API consumers
  if (out._id) {
    try {
      out.id = out._id.toString();
    } catch {}
    delete out._id;
  }
  delete out.passwordHash;
  return out;
}

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

// GET / - listar usuarios (admin only)
usersRouter.get(
  "/",
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await User.find().select("-passwordHash").exec();
      return res.json(items.map(sanitizeUser));
    } catch (err) {
      return next(err as any);
    }
  }
);

// GET /:id - obtener un usuario por id (admin o el propio usuario)
usersRouter.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // TEMP DEBUG: log incoming cookies/authorization and requester so we can
      // determine why a logged-in admin might receive 403. Remove these when
      // debugging is complete.
      try {
        console.log("[DEBUG] GET /api/users/:id - params.id=", id);
        console.log("[DEBUG] incoming cookies:", req.cookies);
        console.log("[DEBUG] authorization header:", req.headers.authorization);
      } catch {
        // ignore logging failures
      }

      const requester = (req as any).user as any;
      try {
        console.log("[DEBUG] requester:", requester);
      } catch {
        // ignore
      }
      const u = await User.findById(id).select("-passwordHash").exec();
      if (!u) return next(new HttpError(404, "User not found"));

      // Allow if requester is admin or requesting own profile
      const uid =
        (u._id && u._id.toString && u._id.toString()) || String(u._id);
      if (!requester) return next(new HttpError(401, "Unauthorized"));
      if (!requester.admin && requester.id !== uid) {
        return next(new HttpError(403, "Forbidden"));
      }

      return res.json(sanitizeUser(u));
    } catch (err) {
      return next(err as any);
    }
  }
);

// POST / - crear usuario
// Special behavior: allow creating the very first user (bootstrap) without
// authentication. After at least one user exists, this endpoint requires an
// authenticated admin.
usersRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as any;

      // basic validation
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

      // If there are existing users, require authenticate + requireAdmin
      if (usersCount > 0) {
        // run authenticate and requireAdmin programmatically so we can allow
        // unauthenticated bootstrap when usersCount === 0
        const runMiddleware = (mw: any) =>
          new Promise<void>((resolve, reject) => {
            try {
              mw(req, res as any, (err: any) =>
                err ? reject(err) : resolve()
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
        // If we're bootstrapping (usersCount === 0), allow admin flag or default
        // to true so the first user can administer the system. Otherwise respect
        // the provided flag (but caller must be admin to set it).
        admin: usersCount === 0 ? !!body.admin || true : !!body.admin,
      });

      // set virtual password so pre-validate hook hashes it
      (user as any).password = body.password;
      await user.save();
      return res.status(201).json(sanitizeUser(user));
    } catch (err) {
      return next(err as any);
    }
  }
);

export default usersRouter;
