import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async (req, user) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, role: true, points: true, credits: true,
        totalPoints: true, isVerified: true, isActive: true, createdAt: true,
        _count: { select: { signals: true, activities: true } },
      },
    });
    if (!profile) return Response.json({ error: "Non trouvé" }, { status: 404 });
    return Response.json({ data: profile });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

export const PATCH = requireAuth(async (req, user) => {
  try {
    const { name, phone, avatar } = await req.json();
    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: { name, phone, avatar },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, role: true, points: true, credits: true,
        totalPoints: true, isVerified: true, isActive: true,
      },
    });
    return Response.json({ data: updated, message: "Profil mis à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});