import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_ROUTES = new Set(["/admin/login"]);

function resolveAdminCookieName() {
  return process.env.ADMIN_SESSION_COOKIE?.trim() || "admin_session";
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
