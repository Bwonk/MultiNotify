import { getDeliveries } from "../services/delivery.service.js";
export async function list(req, res, next) {
    try {
        const result = await getDeliveries({
            campaignId: req.query.campaignId ? +req.query.campaignId : undefined,
            page: +req.query.page || 1,
            limit: +req.query.limit || 50,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
