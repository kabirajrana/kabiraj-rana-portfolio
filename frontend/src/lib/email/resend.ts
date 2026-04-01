import "server-only";

import { serverEnv } from "@/lib/env.server";

type ContactNotificationInput = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildTextBody(input: ContactNotificationInput): string {
  return [
    "New portfolio contact submission",
    "",
    `Full name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Subject: ${input.subject}`,
    "Message:",
    input.message,
    "",
    `Submitted at: ${input.submittedAt.toISOString()}`,
  ].join("\n");
}

function buildOwnerEmailHtmlBody(input: ContactNotificationInput): string {
  const safeMessage = escapeHtml(input.message).replaceAll("\n", "<br/>");
  const safeFullName = escapeHtml(input.fullName);
  const safeEmail = escapeHtml(input.email);
  const safeSubject = escapeHtml(input.subject);
  const safeTimestamp = escapeHtml(input.submittedAt.toISOString());

  return [
    "<div style=\"margin:0;padding:24px;background:#060915;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e6ebff;\">",
    "  <div style=\"max-width:640px;margin:0 auto;background:#0c1224;border:1px solid #1f2a44;border-radius:18px;overflow:hidden;\">",
    "    <div style=\"padding:20px 24px;background:linear-gradient(120deg,#0f172d,#1a2c57);border-bottom:1px solid #25385c;\">",
    "      <p style=\"margin:0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9db0d7;\">Portfolio Contact</p>",
    "      <h1 style=\"margin:8px 0 0;font-size:20px;line-height:1.35;color:#ffffff;\">New message received</h1>",
    "    </div>",
    "    <div style=\"padding:24px;\">",
    "      <table role=\"presentation\" style=\"width:100%;border-collapse:collapse;\">",
    `        <tr><td style=\"padding:0 0 10px;color:#9db0d7;font-size:13px;\">Name</td><td style=\"padding:0 0 10px;color:#ffffff;font-size:14px;text-align:right;\">${safeFullName}</td></tr>`,
    `        <tr><td style=\"padding:0 0 10px;color:#9db0d7;font-size:13px;\">Email</td><td style=\"padding:0 0 10px;color:#ffffff;font-size:14px;text-align:right;\">${safeEmail}</td></tr>`,
    `        <tr><td style=\"padding:0 0 10px;color:#9db0d7;font-size:13px;\">Subject</td><td style=\"padding:0 0 10px;color:#ffffff;font-size:14px;text-align:right;\">${safeSubject}</td></tr>`,
    `        <tr><td style=\"padding:0;color:#9db0d7;font-size:13px;\">Submitted</td><td style=\"padding:0;color:#ffffff;font-size:14px;text-align:right;\">${safeTimestamp}</td></tr>`,
    "      </table>",
    "      <div style=\"margin-top:18px;padding:14px 16px;border:1px solid #2b3f67;border-radius:12px;background:#0a1020;\">",
    "        <p style=\"margin:0 0 8px;color:#9db0d7;font-size:12px;letter-spacing:.08em;text-transform:uppercase;\">Message</p>",
    `        <p style=\"margin:0;color:#d8e2ff;font-size:14px;line-height:1.6;white-space:normal;\">${safeMessage}</p>`,
    "      </div>",
    "    </div>",
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildAutoReplyTextBody(input: ContactNotificationInput): string {
  return [
    `Hi ${input.fullName},`,
    "",
    "Thank you for reaching out through my portfolio.",
    "I have received your message and will get back to you within 24-48 hours.",
    "",
    "Best regards,",
    "Kabiraj Rana",
  ].join("\n");
}

function buildAutoReplyHtmlBody(input: ContactNotificationInput): string {
  const safeName = escapeHtml(input.fullName);

  return [
    "<div style=\"margin:0;padding:24px;background:#060915;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e6ebff;\">",
    "  <div style=\"max-width:640px;margin:0 auto;background:#0c1224;border:1px solid #1f2a44;border-radius:18px;overflow:hidden;\">",
    "    <div style=\"padding:20px 24px;background:linear-gradient(120deg,#0f172d,#1a2c57);border-bottom:1px solid #25385c;\">",
    "      <p style=\"margin:0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9db0d7;\">Kabiraj Rana Portfolio</p>",
    "      <h1 style=\"margin:8px 0 0;font-size:20px;line-height:1.35;color:#ffffff;\">Thanks for your message</h1>",
    "    </div>",
    "    <div style=\"padding:24px;\">",
    `      <p style=\"margin:0 0 12px;font-size:15px;line-height:1.6;color:#d8e2ff;\">Hi ${safeName},</p>`,
    "      <p style=\"margin:0 0 12px;font-size:14px;line-height:1.7;color:#d8e2ff;\">Thank you for reaching out through my portfolio. I have received your message and will get back to you within <strong>24-48 hours</strong>.</p>",
    "      <p style=\"margin:0;font-size:14px;line-height:1.7;color:#d8e2ff;\">Best regards,<br/>Kabiraj Rana</p>",
    "    </div>",
    "  </div>",
    "</div>",
  ].join("\n");
}

async function sendResendEmail(params: {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  apiKey: string;
}): Promise<void> {
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
      reply_to: params.replyTo,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    throw new Error(`Resend request failed (${response.status}): ${responseBody || "unknown error"}`);
  }
}

function getResendConfig(): { apiKey: string; toEmail: string; fromEmail: string } {
  const apiKey = serverEnv.RESEND_API_KEY?.trim();
  const toEmail = serverEnv.CONTACT_TO_EMAIL?.trim();
  const fromEmail = serverEnv.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey || !toEmail || !fromEmail) {
    throw new Error("Contact email is not configured. Please set RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL.");
  }

  return {
    apiKey,
    toEmail,
    fromEmail,
  };
}

export async function sendContactNotificationEmail(input: ContactNotificationInput): Promise<void> {
  const config = getResendConfig();

  await sendResendEmail({
    apiKey: config.apiKey,
    from: config.fromEmail,
    to: config.toEmail,
    subject: `🚀 New Message from ${input.fullName} | ${input.subject}`,
    text: buildTextBody(input),
    html: buildOwnerEmailHtmlBody(input),
    replyTo: input.email,
  });
}

export async function sendContactAutoReplyEmail(input: ContactNotificationInput): Promise<void> {
  const config = getResendConfig();

  await sendResendEmail({
    apiKey: config.apiKey,
    from: config.fromEmail,
    to: input.email,
    subject: "Thanks for contacting me | Message received",
    text: buildAutoReplyTextBody(input),
    html: buildAutoReplyHtmlBody(input),
  });
}