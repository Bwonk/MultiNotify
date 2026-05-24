import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { list, create, getOne, send, stats } from "../controllers/campaign.controller.js";
const router = Router();
const campaignSchema = z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    channel: z.enum(["email", "whatsapp", "both"]),
});
router.use(authenticate);
router.get("/", list);
router.post("/", validate(campaignSchema), create);
router.get("/:id", getOne);
router.post("/:id/send", send);
router.get("/:id/stats", stats);
export default router;
