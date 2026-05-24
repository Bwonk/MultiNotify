import twilio from 'twilio';
import { env } from '../config/env.js';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export async function sendSMS({ to, message }: { to: string; message: string }) {
  const phone = to.startsWith('+') ? to : `+${to}`;

  const result = await client.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  if (result.errorCode) {
    throw new Error(result.errorMessage || 'SMS gönderim hatası');
  }

  return result;
}
