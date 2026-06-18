import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, verifyToken },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        points: true,
        credits: true,
        totalPoints: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = Response.json(
      { message: "Compte créé ! Bienvenue 🌿", data: { user, token } },
      { status: 201 }
    );

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
    console.error("Register error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}