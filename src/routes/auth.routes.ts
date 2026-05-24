import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.middleware.js";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

const loginSchema    = z.object({ email: z.string().email(), password: z.string().min(6) });
const registerSchema = loginSchema.extend({ name: z.string().optional() });

router.post("/register", validate(registerSchema), register);
router.post("/login",    validate(loginSchema),    login);

export default router;