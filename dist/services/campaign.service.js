import prisma from "../config/db.js";
import { sendEmail } from "./email.service.js";
import { sendWhatsApp } from "./whatsapp.service.js";
import { logDelivery } from "./delivery.service.js";
export const createCampaign = (data) => prisma.campaign.create({ data });
export async function listCampaigns({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.campaign.findMany({ skip, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { deliveries: true } } } }),
        prisma.campaign.count(),
    ]);
    return { items, total, page, limit };
}
export const getCampaign = (id) => prisma.campaign.findUnique({ where: { id } });
export async function sendCampaign(campaignId) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign)
        throw Object.assign(new Error("Campaign bulunamadı"), { status: 404 });
    if (campaign.status === "sending")
        throw Object.assign(new Error("Zaten gönderiliyor"), { status: 409 });
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: "sending" } });
    const users = await prisma.user.findMany({ where: { isActive: true } });
    let successCount = 0, failCount = 0;
    for (const user of users) {
        const channels = resolveChannels(campaign.channel, user.preferredChannel);
        for (const channel of channels) {
            try {
                if (channel === "email" && user.email)
                    await sendEmail({ to: user.email, subject: campaign.title, text: campaign.message });
                else if (channel === "whatsapp" && user.phone)
                    await sendWhatsApp({ to: user.phone, message: campaign.message });
                else
                    continue;
                await logDelivery({ campaignId, userId: user.id, channel, status: "success" });
                successCount++;
            }
            catch (err) {
                await logDelivery({ campaignId, userId: user.id, channel, status: "failed", errorMessage: err.message });
                failCount++;
            }
        }
    }
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: "completed", sentAt: new Date() } });
    return { successCount, failCount, total: users.length };
}
export async function getCampaignStats(campaignId) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign)
        throw Object.assign(new Error("Campaign bulunamadı"), { status: 404 });
    const stats = await prisma.delivery.groupBy({ by: ["channel", "status"], where: { campaignId }, _count: true });
    const result = { email: { success: 0, failed: 0 }, whatsapp: { success: 0, failed: 0 } };
    for (const s of stats)
        result[s.channel][s.status] = s._count;
    const total = await prisma.delivery.count({ where: { campaignId } });
    const success = await prisma.delivery.count({ where: { campaignId, status: "success" } });
    return { campaign, stats: result, total, success, failed: total - success };
}
function resolveChannels(campaignCh, userCh) {
    if (campaignCh === "both" && userCh === "both")
        return ["email", "whatsapp"];
    if (campaignCh === "both")
        return [userCh];
    if (userCh === "both")
        return [campaignCh];
    if (campaignCh === userCh)
        return [campaignCh];
    return [];
}
