"use server";

import { submitContactMessageAction } from "@/app/(admin)/admin/actions";

export async function submitPublicContactAction(formData: FormData) {
  const sender = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const payload = new FormData();
  payload.set("sender", sender.length >= 2 ? sender : "Anonymous");
  payload.set("email", email);
  payload.set("subject", subject.length >= 2 ? subject : "General Inquiry");
  payload.set("body", message);
  payload.set("honeypot", String(formData.get("honeypot") ?? ""));

  return submitContactMessageAction(payload);
}
