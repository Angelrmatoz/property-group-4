import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { login } from "@/controllers/login";
import { root, getMe } from "@/controllers/auth";
import authenticate from "@/middleware/auth";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", authLimiter, login);
router.get("/", root);
router.get("/me", authenticate, getMe);

export default router;
