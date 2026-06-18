import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async (req, user) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return Response.json({ data: notifications });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

export const PATCH = requireAuth(async (req, user) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: user.userId, isRead: false },
      data: { isRead: true },
    });
    return Response.json({ message: "Toutes les notifications marquées comme lues" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});