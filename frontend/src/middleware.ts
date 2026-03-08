import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ADMIN_ROUTES = new Set(["/admin/login"]);
const DEFAULT_ADMIN_JWT_SECRET = "replace_with_long_random_secret_replace_with_long_random_secret";

function resolveAdminCookieName() {
  return process.env.ADMIN_SESSION_COOKIE?.trim() || "admin_session";
}

function resolveAdminJwtSecret() {
  return process.env.ADMIN_JWT_SECRET?.trim() || DEFAULT_ADMIN_JWT_SECRET;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const cookieName = resolveAdminCookieName();
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  const secret = resolveAdminJwtSecret();

  let role: string | undefined;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    role = String(payload.role ?? "");
  } catch (error) {
    console.warn("[admin-middleware] Failed to verify admin session token", {
      pathname,
      message: error instanceof Error ? error.message : "unknown",
    });
    role = undefined;
  }

  if (role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
