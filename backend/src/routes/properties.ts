import { Router } from "express";
import authenticate from "@/middleware/auth";
import { list, getById, create, update, remove, upload } from "@/controllers/properties";

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, upload.array("images", 10), create);
router.put("/:id", authenticate, upload.array("images", 10), update);
router.delete("/:id", authenticate, remove);

export default router;
