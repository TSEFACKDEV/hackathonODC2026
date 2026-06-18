import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const PATCH = requireRole(["ADMIN"], async (req) => {
  const id = req.url.split("/api/activities/")[1].split("/")[0];
  try {
    const { status, score, adminNote } = await req.json();

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        status,
        score: score || 0,
        adminNote: adminNote || null,
      },
    });

    // Si approuvée → ajouter les points à l'utilisateur
    if (status === "APPROVED" && score && score > 0) {
      await prisma.user.update({
        where: { id: activity.userId },
        data: {
          points: { increment: score },
          totalPoints: { increment: score },
        },
      });
      // Notifier l'utilisateur
      await prisma.notification.create({
        data: {
          userId: activity.userId,
          title: "🎉 Activité approuvée !",
          message: `Votre activité "${activity.title}" a été validée. +${score} points !`,
          type: "activity",
          link: "/activities",
        },
      });
    } else if (status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId: activity.userId,
          title: "❌ Activité non retenue",
          message: `Votre activité "${activity.title}" n'a pas été retenue.`,
          type: "activity",
        },
      });
    }

    return Response.json({ data: activity, message: "Statut mis à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});