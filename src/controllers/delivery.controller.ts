import { Request, Response, NextFunction } from "express";
import { getDeliveries } from "../services/delivery.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getDeliveries({
      campaignId: req.query.campaignId ? +req.query.campaignId : undefined,
      page: +(req.query.page as string) || 1,
      limit: +(req.query.limit as string) || 50,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}