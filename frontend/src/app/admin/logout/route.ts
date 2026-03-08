import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env.server";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  cookieStore.set(serverEnv.ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
