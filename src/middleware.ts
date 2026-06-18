import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

// Routes totalement publiques (jamais de redirect)
const PUBLIC_PAGES = ["/", "/tips", "/planning", "/activities", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

// Routes protégées admin
const ADMIN_ROUTES = ["/admin"];

// Routes protégées agent
const AGENT_ROUTES = ["/agent"];

// Routes protégées user (requiert connexion)
const AUTH_REQUIRED = ["/signals", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Ignorer assets statiques ──────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── API : laisser passer, chaque handler gère son auth ───
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ── Pages publiques ──────────────────────────────────────
  const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p);
  if (isPublicPage) return NextResponse.next();

  // ── Lire le token ────────────────────────────────────────
  const token =
    req.cookies.get("access_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  // ── Routes qui nécessitent une authentification ──────────
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  if (needsAuth && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Vérifier le token si présent ─────────────────────────
  if (token) {
    try {
      const user = verifyAccessToken(token);

      // Admin routes → refuser si pas ADMIN
      if (ADMIN_ROUTES.some((p) => pathname.startsWith(p))) {
        if (user.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      // Agent routes → refuser si pas AGENT ou ADMIN
      if (AGENT_ROUTES.some((p) => pathname.startsWith(p))) {
        if (!["AGENT", "ADMIN"].includes(user.role)) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      return NextResponse.next();
    } catch {
      // Token invalide → rediriger vers login pour routes protégées
      if (needsAuth || ADMIN_ROUTES.some((p) => pathname.startsWith(p))) {
        const url = new URL("/login", req.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};