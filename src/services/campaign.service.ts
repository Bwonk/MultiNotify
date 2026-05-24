import prisma from "../config/db.js";
import { Channel } from "../../generated/prisma/client.js";
import { sendEmail } from "./email.service.js";
import { sendWhatsApp } from "./whatsapp.service.js";
import { sendSMS } from "./sms.service.js";
import { logDelivery } from "./delivery.service.js";

export const createCampaign = (data: { title: string; message: string; channel: Channel }) =>
  prisma.campaign.create({ data });

export async function listCampaigns({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.campaign.findMany({ skip, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { deliveries: true } } } }),
    prisma.campaign.count(),
  ]);
  return { items, total, page, limit };
}

export const getCampaign = (id: number) => prisma.campaign.findUnique({ where: { id } });

export async function sendCampaign(campaignId: number) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw Object.assign(new Error("Campaign bulunamadı"), { status: 404 });
  if (campaign.status === "sending") throw Object.assign(new Error("Zaten gönderiliyor"), { status: 409 });

  await prisma.campaign.update({ where: { id: campaignId }, data: { status: "sending" } });
  const users = await prisma.user.findMany({ where: { isActive: true } });
  let successCount = 0, failCount = 0;

  for (const user of users) {
    const channels = resolveChannels(campaign.channel);
    for (const channel of channels) {
      try {
        if (channel === "email" && user.email) {
          await sendEmail({ to: user.email, subject: campaign.title, text: campaign.message });
        } else if (channel === "whatsapp" && user.phone) {
          await sendWhatsApp({ to: user.phone, message: campaign.message });
        } else if (channel === "sms" && user.phone) {
          await sendSMS({ to: user.phone, message: campaign.message });
        } else {
          continue;
        }
        await logDelivery({ campaignId, userId: user.id, channel, status: "success" });
        successCount++;
      } catch (err: any) {
        await logDelivery({ campaignId, userId: user.id, channel, status: "failed", errorMessage: err.message });
        failCount++;
      }
    }
  }

  await prisma.campaign.update({ where: { id: campaignId }, data: { status: "completed", sentAt: new Date() } });
  return { successCount, failCount, total: users.length };
}

export async function getCampaignStats(campaignId: number) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw Object.assign(new Error("Campaign bulunamadı"), { status: 404 });
  const stats = await prisma.delivery.groupBy({ by: ["channel", "status"], where: { campaignId }, _count: true });
  const result = { email: { success: 0, failed: 0 }, whatsapp: { success: 0, failed: 0 }, sms: { success: 0, failed: 0 } };
  for (const s of stats) (result as any)[s.channel][s.status] = s._count;
  const total   = await prisma.delivery.count({ where: { campaignId } });
  const success = await prisma.delivery.count({ where: { campaignId, status: "success" } });
  return { campaign, stats: result, total, success, failed: total - success };
}

function resolveChannels(campaignCh: Channel): ("email" | "whatsapp" | "sms")[] {
  if (campaignCh === "both") return ["email", "whatsapp"];
  if (campaignCh === "email") return ["email"];
  if (campaignCh === "whatsapp") return ["whatsapp"];
  if (campaignCh === "sms") return ["sms"];
  return [];
}