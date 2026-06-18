import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tip = await prisma.tip.findUnique({
      where: { id },
      include: { admin: { select: { id: true, name: true } } },
    });
    if (!tip) return Response.json({ error: "Non trouvé" }, { status: 404 });
    await prisma.tip.update({ where: { id }, data: { views: { increment: 1 } } });
    return Response.json({ data: tip });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const PUT = requireRole(["ADMIN"], async (req) => {
  const id = req.url.split("/api/tips/")[1].split("/")[0];
  try {
    const body = await req.json();
    const tip = await prisma.tip.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl || null,
        type: body.type,
        isPublished: body.isPublished,
      },
      include: { admin: { select: { id: true, name: true } } },
    });
    return Response.json({ data: tip, message: "Astuce mise à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

export const DELETE = requireRole(["ADMIN"], async (req) => {
  const id = req.url.split("/api/tips/")[1].split("/")[0];
  try {
    await prisma.tip.delete({ where: { id } });
    return Response.json({ message: "Astuce supprimée" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});