import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";

const buildAuthCookie = (token: string) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `access_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`;
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return Response.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });

    const { password: _, resetToken: __, verifyToken: ___, ...safeUser } = user;

    return new Response(JSON.stringify({
      message: "Connexion réussie",
      data: { user: safeUser, token },
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": buildAuthCookie(token),
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}