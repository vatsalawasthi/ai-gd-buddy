import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ai_gd_token";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/practice",
  "/gd-room",
  "/reports",
  "/history",
  "/recording-analyzer",
  "/ai-coach",
  "/profile",
  "/onboarding",
  "/admin",
];

const AUTH_PAGES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  // If visiting protected route without token, redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If visiting login/register with valid token, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/gd-room/:path*",
    "/reports/:path*",
    "/history/:path*",
    "/recording-analyzer/:path*",
    "/ai-coach/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
