import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "@/supabase";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = (req.headers.authorization ?? "") as string;
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader || null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const { data, error } = await supabaseAdmin!.auth.getUser(token);
    if (error || !data?.user)
      return res.status(401).json({ error: "Invalid token" });

    (req as any).user = data.user;
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Auth error", details: String(err) });
  }
}
