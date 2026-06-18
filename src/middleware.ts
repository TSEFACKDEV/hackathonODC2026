import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "ecotrack_super_secret_jwt_2025_change_en_production"
);

// Pages accessibles sans connexion
const PUBLIC_PAGES = [
  "/",
  "/tips",
  "/planning",
  "/activities",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Pages qui nécessitent d'être connecté
const AUTH_REQUIRED = ["/signals", "/profile"];

// Pages réservées admin
const ADMIN_PAGES = ["/admin"];

// Pages réservées agent
const AGENT_PAGES = ["/agent"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Ignorer assets statiques ─────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Laisser passer les API routes ────────────────────────
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PAGES.includes(pathname);
  const needsAuth =
    AUTH_REQUIRED.some((p) => pathname.startsWith(p)) ||
    ADMIN_PAGES.some((p) => pathname.startsWith(p)) ||
    AGENT_PAGES.some((p) => pathname.startsWith(p));

  // ── Lire le token JWT custom ─────────────────────────────
  const token = req.cookies.get("access_token")?.value;

  // ── Pas de token ─────────────────────────────────────────
  if (!token) {
    if (needsAuth) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Vérifier le token avec jose (Edge compatible) ────────
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    // Déjà connecté → éviter login/register
    if (pathname === "/login" || pathname === "/register") {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "AGENT") return NextResponse.redirect(new URL("/agent", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Vérification rôle admin
    if (ADMIN_PAGES.some((p) => pathname.startsWith(p)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Vérification rôle agent
    if (
      AGENT_PAGES.some((p) => pathname.startsWith(p)) &&
      !["AGENT", "ADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    // Token expiré ou invalide
    const res = needsAuth
      ? NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
      : NextResponse.next();

    // Supprimer le cookie corrompu
    res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|uploads).*)"],
};