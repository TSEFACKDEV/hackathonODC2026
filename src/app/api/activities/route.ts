import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { status: "APPROVED" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, avatar: true, totalPoints: true } } },
      }),
      prisma.activity.count({ where: { status: "APPROVED" } }),
    ]);

    const parsed = activities.map((a) => ({
      ...a,
      tags: a.tags ? JSON.parse(a.tags) : [],
    }));

    return Response.json({ data: parsed, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = requireAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { title, description, mediaUrl, mediaType, tags } = body;

    if (!title || !description) {
      return Response.json({ error: "Titre et description requis" }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        userId: user.userId,
        title,
        description,
        mediaUrl,
        mediaType,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return Response.json({ data: activity, message: "Activité publiée, en attente de validation" }, { status: 201 });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});