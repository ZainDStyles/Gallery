import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap first gate for the dashboard: no session cookie → straight to login.
 * The real check (valid, unexpired, two-factor-verified session in the
 * database) happens in `requireAdmin()` on every page, action and API route.
 */
const PUBLIC_ADMIN = ["/admin/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_ADMIN.includes(pathname)) return NextResponse.next();

  const hasCookie = req.cookies.has("__Host-fatemeh_admin") || req.cookies.has("fatemeh_admin");
  if (!hasCookie) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
