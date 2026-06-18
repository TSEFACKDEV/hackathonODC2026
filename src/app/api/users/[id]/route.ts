import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

// GET /api/users/me → profil de l'utilisateur connecté
export const GET = requireAuth(async (req, user) => {
  try {
    const id = req.url.split("/api/users/")[1].split("/")[0];
    // Un user ne peut voir que son propre profil, un admin peut voir tout
    if (id !== "me" && id !== user.userId && user.role !== "ADMIN") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }
    const targetId = id === "me" ? user.userId : id;
    const profile = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, role: true, points: true, credits: true,
        totalPoints: true, isVerified: true, isActive: true, createdAt: true,
        _count: { select: { signals: true, activities: true } },
      },
    });
    if (!profile) return Response.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    return Response.json({ data: profile });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

// PATCH /api/users/[id] → modifier un utilisateur
export const PATCH = requireAuth(async (req, user) => {
  try {
    const id = req.url.split("/api/users/")[1].split("/")[0];
    const targetId = id === "me" ? user.userId : id;

    // Seul l'admin peut modifier les autres ou changer le rôle
    if (targetId !== user.userId && user.role !== "ADMIN") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    // Champs modifiables par l'utilisateur lui-même
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    // Champs modifiables seulement par l'admin
    if (user.role === "ADMIN") {
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.role !== undefined) updateData.role = body.role;
      if (body.points !== undefined) updateData.points = body.points;
      if (body.credits !== undefined) updateData.credits = body.credits;
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
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