import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { list, create, remove } from "../controllers/user.controller.js";

const router = Router();

const userSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name:  z.string().optional(),
}).refine((d) => d.email || d.phone, { message: "Email veya telefon gerekli" });

router.use(authenticate);
router.get("/",       list);
router.post("/",      validate(userSchema), create);
router.delete("/:id", remove);

export default router;