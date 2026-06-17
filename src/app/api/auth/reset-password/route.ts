import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return Response.json({ error: "Token et mot de passe requis" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return Response.json({ error: "Lien invalide ou expiré" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetExpiry: null },
    });

    return Response.json({ message: "Mot de passe réinitialisé avec succès" });

  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}