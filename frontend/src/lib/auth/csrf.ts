import { SignJWT, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env.server";

const encoder = new TextEncoder();
const secret = encoder.encode(serverEnv.ADMIN_JWT_SECRET);

export async function ensureCsrfToken(): Promise<string> {
  return new SignJWT({ purpose: "csrf" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function validateCsrfToken(inputToken: string): Promise<boolean> {
  if (!inputToken) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(inputToken, secret, {
      algorithms: ["HS256"],
    });

    return payload.purpose === "csrf";
  } catch {
    return false;
  }
}
