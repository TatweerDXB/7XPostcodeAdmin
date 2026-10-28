import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "X-User-Token",
  "x-user-token",
  "X-Refresh-Token",
];

const FORBIDDEN_QUERY_TOKENS = ["token", "access_token", "apikey", "api_key", "secret"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const hasForbiddenTokenInQuery = FORBIDDEN_QUERY_TOKENS.some((key) => searchParams.has(key));
  if (hasForbiddenTokenInQuery) {
    const cleanUrl = new URL(pathname, request.url);
    searchParams.forEach((val, key) => {
      if (!FORBIDDEN_QUERY_TOKENS.includes(key.toLowerCase())) {
        cleanUrl.searchParams.set(key, val);
      }
    });
    const redirectResponse = NextResponse.redirect(cleanUrl);
    redirectResponse.headers.set("X-Frame-Options", "DENY");
    redirectResponse.headers.set("X-Content-Type-Options", "nosniff");
    return redirectResponse;
  }

  const hasAuthCookie = AUTH_COOKIE_KEYS.some((key) => {
    const cookie = request.cookies.get(key);
    return Boolean(cookie && cookie.value && cookie.value.trim() !== "");
  });

  const PROTECTED_PREFIXES = [
    "/search",
    "/heatmap",
    "/address-registry",
    "/grid-engine",
    "/postcode-list",
    "/portal",
  ];
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isLoginRoute = pathname === "/" || pathname === "/login";

  // Redirect legacy /portal routes to /search or corresponding top-level path
  if (pathname === "/portal" || pathname === "/portal/") {
    const searchUrl = new URL("/search", request.url);
    const redirectResponse = NextResponse.redirect(searchUrl);
    redirectResponse.headers.set("X-Frame-Options", "DENY");
    redirectResponse.headers.set("X-Content-Type-Options", "nosniff");
    return redirectResponse;
  }
  if (pathname.startsWith("/portal/")) {
    const newPath = pathname.replace(/^\/portal/, "");
    const targetUrl = new URL(newPath, request.url);
    const redirectResponse = NextResponse.redirect(targetUrl);
    redirectResponse.headers.set("X-Frame-Options", "DENY");
    redirectResponse.headers.set("X-Content-Type-Options", "nosniff");
    return redirectResponse;
  }

  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    loginUrl.searchParams.set("reason", "session_expired");
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("X-Frame-Options", "DENY");
    redirectResponse.headers.set("X-Content-Type-Options", "nosniff");
    return redirectResponse;
  }

  if (isLoginRoute && hasAuthCookie) {
    const searchUrl = new URL("/search", request.url);
    const redirectResponse = NextResponse.redirect(searchUrl);
    redirectResponse.headers.set("X-Frame-Options", "DENY");
    redirectResponse.headers.set("X-Content-Type-Options", "nosniff");
    return redirectResponse;
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
