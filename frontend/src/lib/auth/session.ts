import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { serverEnv } from "@/lib/env.server";
import type { AdminSession } from "@/types/admin";

const encoder = new TextEncoder();
const secret = encoder.encode(serverEnv.ADMIN_JWT_SECRET);

interface SessionPayload extends AdminSession {
  iat: number;
  exp: number;
}

export async function signAdminSession(session: AdminSession): Promise<string> {
  const ttl = serverEnv.ADMIN_SESSION_TTL_SECONDS;

  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secret);
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(serverEnv.ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSession(token);
}
