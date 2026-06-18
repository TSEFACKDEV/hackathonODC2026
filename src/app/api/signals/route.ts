import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") where.status = status;

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.signal.count({ where }),
    ]);

    return Response.json({ data: signals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = requireAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { description, imageUrl, latitude, longitude, address, severity } = body;

    if (!description || !imageUrl || latitude == null || longitude == null) {
      return Response.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const signal = await prisma.signal.create({
      data: {
        userId: user.userId,
        description,
        imageUrl,
        latitude: parseFloat(String(latitude)),
        longitude: parseFloat(String(longitude)),
        address: address || null,
        severity: parseInt(String(severity)) || 2,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // +10 points
    await prisma.user.update({
      where: { id: user.userId },
      data: { points: { increment: 10 }, totalPoints: { increment: 10 } },
    });

    // Notification admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: "📍 Nouveau signalement",
          message: `Un dépôt a été signalé — Gravité : ${["","Faible","Moyen","Grave"][severity] || "?"}`,
          type: "signal",
          link: `/admin/signals`,
        })),
      });
    }

    return Response.json({ data: signal, message: "Signalement créé ! +10 points 🌿" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});