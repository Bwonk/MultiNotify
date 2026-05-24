import { Resend } from "resend";
import { env } from "../config/env.js";
const resend = new Resend(env.RESEND_API_KEY);
export async function sendEmail({ to, subject, text }) {
    const { data, error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html: `<p>${text}</p>`,
    });
    if (error)
        throw new Error(error.message);
    return data;
}
