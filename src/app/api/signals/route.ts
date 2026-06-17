import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

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

    return Response.json({
      data: signals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = requireAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { description, imageUrl, latitude, longitude, address, severity } = body;

    if (!description || !imageUrl || !latitude || !longitude) {
      return Response.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const signal = await prisma.signal.create({
      data: {
        userId: user.userId,
        description,
        imageUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        severity: severity || 1,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Ajouter des points pour le signalement
    await prisma.user.update({
      where: { id: user.userId },
      data: { points: { increment: 10 }, totalPoints: { increment: 10 } },
    });

    // Notifier les admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: "Nouveau signalement",
        message: `${user.email} a signalé un dépôt d'ordures`,
        type: "signal",
        link: `/admin/signals/${signal.id}`,
      })),
    });

    return Response.json({ data: signal, message: "Signalement créé (+10 points)" }, { status: 201 });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});