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
        totalPoints: true, isVerified: true, createdAt: true,
        _count: { select: { signals: true, activities: true } },
      },
    });
    return Response.json({ data: profile });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

export const PATCH = requireAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { name, phone, avatar } = body;

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: { name, phone, avatar },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, role: true, points: true, credits: true,
        totalPoints: true, isVerified: true,
      },
    });
    return Response.json({ data: updated, message: "Profil mis à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});