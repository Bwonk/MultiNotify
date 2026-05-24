import { env } from "../config/env.js";
export async function sendWhatsApp({ to, message }) {
    const phone = to.startsWith("+") ? to : `+${to}`;
    const url = `https://graph.facebook.com/${env.META_API_VERSION}/${env.META_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.META_ACCESS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: phone, type: "text", text: { body: message } }),
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(data?.error?.message || "WhatsApp gönderim hatası");
    return data;
}
