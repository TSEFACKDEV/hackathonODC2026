import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";

const buildAuthCookie = (token: string) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `access_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return Response.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        verifyToken,
      },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, points: true, credits: true,
        totalPoints: true, isVerified: true, createdAt: true,
      },
    });

    await sendVerificationEmail(email, name, verifyToken);

    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });

    return new Response(JSON.stringify({
      message: "Compte créé ! Vérifiez votre email.",
      data: { user, token },
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": buildAuthCookie(token),
      },
    });

  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}