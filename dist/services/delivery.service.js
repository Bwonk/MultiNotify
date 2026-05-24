import prisma from "../config/db.js";
export async function logDelivery({ campaignId, userId, channel, status, errorMessage = null }) {
    return prisma.delivery.create({ data: { campaignId, userId, channel, status, errorMessage } });
}
export async function getDeliveries({ campaignId, page = 1, limit = 50 } = {}) {
    const where = campaignId ? { campaignId } : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.delivery.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true, email: true, phone: true } }, campaign: { select: { id: true, title: true } } } }),
        prisma.delivery.count({ where }),
    ]);
    return { items, total, page, limit };
}
