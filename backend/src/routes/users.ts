import { Router } from "express";
import authenticate from "@/middleware/auth";
import requireAdmin from "@/middleware/requireAdmin";
import { list, getById, create, remove } from "@/controllers/users";

const router = Router();

router.get("/", authenticate, requireAdmin, list);
router.get("/:id", authenticate, getById);
router.post("/", create);
router.delete("/:id", authenticate, requireAdmin, remove);

export default router;
