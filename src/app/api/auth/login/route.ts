import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return Response.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const {
      password: _p,
      resetToken: _r,
      verifyToken: _v,
      resetExpiry: _e,
      ...safeUser
    } = user;

    // Construire la réponse avec le cookie
    const response = Response.json({
      message: "Connexion réussie",
      data: { user: safeUser, token },
    });

    // Écrire le cookie access_token lisible par le middleware
    response.headers.append(
      "Set-Cookie",
      [
        `access_token=${token}`,
        "Path=/",
        `Max-Age=${7 * 24 * 3600}`,
        "SameSite=Lax",
        process.env.NODE_ENV === "production" ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; ")
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}