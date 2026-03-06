import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ADMIN_ROUTES = new Set(["/admin/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const cookieName = process.env.ADMIN_SESSION_COOKIE ?? "admin_session";
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  let role: string | undefined;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    role = String(payload.role ?? "");
  } catch {
    role = undefined;
  }

  if (role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
