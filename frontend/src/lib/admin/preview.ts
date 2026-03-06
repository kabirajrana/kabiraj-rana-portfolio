import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env.server";

const encoder = new TextEncoder();
const secret = encoder.encode(serverEnv.ADMIN_PREVIEW_SECRET);

type PreviewPayload = {
  userId: string;
  role: "ADMIN";
};

export async function createPreviewToken(payload: PreviewPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyPreviewToken(token: string) {
  try {
    const { payload } = await jwtVerify<PreviewPayload>(token, secret, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function isPreviewEnabledForRequest() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-admin-preview") === "1";
}

export async function setPreviewCookie(token: string) {
  (await cookies()).set(serverEnv.ADMIN_PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearPreviewCookie() {
  (await cookies()).delete(serverEnv.ADMIN_PREVIEW_COOKIE);
}
