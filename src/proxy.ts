import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Known auth cookie names used across backend & client
const AUTH_COOKIE_KEYS = [
  "jwtToken",
  "auth_session",
  "token",
  "accessToken",
  "access_token",
  "jwt",
  "session",
  "refreshToken",
  "refresh_token",
  "connect.sid",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if any recognized auth cookie is present
  const hasAuthCookie = AUTH_COOKIE_KEYS.some((key) => {
    const cookie = request.cookies.get(key);
    return cookie && cookie.value && cookie.value.trim() !== "";
  });

  const isPortalRoute = pathname.startsWith("/portal");
  const isLoginRoute = pathname === "/";

  // 1. Protect inner routes: If accessing /portal without auth cookie, redirect to login
  if (isPortalRoute && !hasAuthCookie) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from login page to /portal
  if (isLoginRoute && hasAuthCookie) {
    const portalUrl = new URL("/portal", request.url);
    return NextResponse.redirect(portalUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image/asset files (.png, .jpg, .jpeg, .svg, .webp, .ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
