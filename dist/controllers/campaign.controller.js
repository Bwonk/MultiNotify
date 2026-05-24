import * as svc from "../services/campaign.service.js";
export const list = async (req, res, next) => { try {
    res.json({ success: true, ...(await svc.listCampaigns({ page: +(req.query.page || 1), limit: +(req.query.limit || 20) })) });
}
catch (e) {
    next(e);
} };
export const create = async (req, res, next) => { try {
    res.status(201).json({ success: true, data: await svc.createCampaign(req.body) });
}
catch (e) {
    next(e);
} };
export const getOne = async (req, res, next) => { try {
    const c = await svc.getCampaign(+req.params.id);
    if (!c)
        return res.status(404).json({ success: false, message: "Bulunamadı" });
    res.json({ success: true, data: c });
}
catch (e) {
    next(e);
} };
export const send = async (req, res, next) => { try {
    res.json({ success: true, data: await svc.sendCampaign(+req.params.id) });
}
catch (e) {
    next(e);
} };
export const stats = async (req, res, next) => { try {
    res.json({ success: true, data: await svc.getCampaignStats(+req.params.id) });
}
catch (e) {
    next(e);
} };
