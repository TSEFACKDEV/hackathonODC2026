import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/"];
const adminPaths = ["/admin"];
const agentPaths = ["/agent"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic || pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/images")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value ||
    req.headers.get("authorization")?.slice(7);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = verifyAccessToken(token);
    if (adminPaths.some((p) => pathname.startsWith(p)) && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (agentPaths.some((p) => pathname.startsWith(p)) && !["AGENT", "ADMIN"].includes(user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|uploads).*)"],
};