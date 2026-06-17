import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };
    if (type) where.type = type;

    const [tips, total] = await Promise.all([
      prisma.tip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.tip.count({ where }),
    ]);

    return Response.json({ data: tips, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = requireRole(["ADMIN"], async (req, user) => {
  try {
    const body = await req.json();
    const { title, content, imageUrl, type } = body;

    if (!title || !content) {
      return Response.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    const tip = await prisma.tip.create({
      data: { adminId: user.userId, title, content, imageUrl, type: type || "GENERAL" },
      include: { admin: { select: { id: true, name: true } } },
    });

    return Response.json({ data: tip }, { status: 201 });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});