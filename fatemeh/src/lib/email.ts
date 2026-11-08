import "server-only";
import nodemailer from "nodemailer";
import { appUrl, env } from "./env";

/**
 * Notification emails deliberately contain NO patient information:
 * no names, no health details, no photos — only a reference and a link
 * to the secure dashboard. Email is not a secure channel.
 */
type Mail = { to: string; subject: string; text: string; html: string };

async function send(mail: Mail) {
  const e = env();
  if (e.EMAIL_PROVIDER === "console") {
    console.info(`[email:console] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return;
  }
  if (e.EMAIL_PROVIDER === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: e.EMAIL_FROM, ...mail }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    return;
  }
  const transport = nodemailer.createTransport({
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    secure: e.SMTP_PORT === 465,
    auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASSWORD } : undefined,
  });
  await transport.sendMail({ from: e.EMAIL_FROM, ...mail });
}

const layout = (body: string) => `<!doctype html><html><body style="margin:0;background:#f6f1e9;font-family:Helvetica,Arial,sans-serif;color:#1c1b19">
<div style="max-width:520px;margin:0 auto;padding:40px 24px">
<p style="font-family:Georgia,serif;font-size:22px;letter-spacing:.02em;margin:0 0 28px">Fatemeh <span style="color:#8a5d33;font-size:12px;letter-spacing:.2em;text-transform:uppercase">Hair Restoration</span></p>
${body}
</div></body></html>`;

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function notifyNewEnquiry(enquiryId: string, reference: string) {
  const to = env().NOTIFY_EMAIL;
  if (!to) return console.warn("[email] NOTIFY_EMAIL not set; skipping enquiry notification");
  const link = `${appUrl()}/admin/enquiries/${enquiryId}`;
  await send({
    to,
    subject: `New hair assessment · ${reference}`,
    text: `A new hair assessment has been submitted.\n\nReference: ${reference}\n\nFor privacy, details and photographs are only available in the secure dashboard:\n${link}`,
    html: layout(`<p style="font-size:16px;line-height:1.6">A new hair assessment has been submitted.</p>
<p style="font-size:14px;color:#5e5850">Reference</p><p style="font-size:20px;letter-spacing:.08em;margin-top:-8px"><strong>${escape(reference)}</strong></p>
<p style="font-size:14px;line-height:1.6;color:#5e5850">For privacy, patient details and photographs are only available in the secure dashboard.</p>
<p><a href="${escape(link)}" style="display:inline-block;background:#1c1b19;color:#f6f1e9;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px">Open dashboard</a></p>`),
  });
}

export async function notifyNewMessage(reference: string) {
  const to = env().NOTIFY_EMAIL;
  if (!to) return;
  const link = `${appUrl()}/admin/messages`;
  await send({
    to,
    subject: `New website message · ${reference}`,
    text: `A new message was sent through the website contact form.\n\nReference: ${reference}\n\nRead it in the dashboard:\n${link}`,
    html: layout(`<p style="font-size:16px;line-height:1.6">A new message was sent through the website contact form.</p>
<p style="font-size:14px;color:#5e5850">Reference: <strong>${escape(reference)}</strong></p>
<p><a href="${escape(link)}" style="display:inline-block;background:#1c1b19;color:#f6f1e9;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px">Open dashboard</a></p>`),
  });
}

/** Sent to the patient. Contains only their reference — no health details. */
export async function confirmToPatient(to: string, reference: string) {
  if (!env().SEND_PATIENT_CONFIRMATION) return;
  await send({
    to,
    subject: `We've received your hair assessment · ${reference}`,
    text: `Thank you. We've received your hair assessment.\n\nYour reference: ${reference}\n\nWe'll review it personally and contact you using your preferred method. If you didn't submit this, please ignore this email.`,
    html: layout(`<p style="font-size:16px;line-height:1.6">Thank you. We've received your hair assessment.</p>
<p style="font-size:14px;color:#5e5850">Your reference</p><p style="font-size:20px;letter-spacing:.08em;margin-top:-8px"><strong>${escape(reference)}</strong></p>
<p style="font-size:14px;line-height:1.6;color:#5e5850">We'll review it personally and contact you using your preferred method. If you didn't submit this, you can ignore this email.</p>`),
  });
}
