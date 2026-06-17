import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return Response.json({ error: "Email requis" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Réponse identique pour ne pas révéler l'existence du compte
    if (!user) {
      return Response.json({ message: "Si cet email existe, vous recevrez un lien." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 3600000); // 1 heure

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetExpiry },
    });

    await sendPasswordResetEmail(email, user.name, resetToken);

    return Response.json({ message: "Si cet email existe, vous recevrez un lien." });

  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}