import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const signal = await prisma.signal.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    if (!signal) return Response.json({ error: "Non trouvé" }, { status: 404 });
    return Response.json({ data: signal });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const PATCH = requireRole(["ADMIN", "AGENT"], async (req) => {
  const id = req.url.split("/api/signals/")[1].split("/")[0];
  try {
    const body = await req.json();
    const signal = await prisma.signal.update({
      where: { id },
      data: {
        status: body.status,
        agentNote: body.agentNote || undefined,
        collectedAt: body.status === "COLLECTED" ? new Date() : undefined,
      },
    });
    return Response.json({ data: signal, message: "Statut mis à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});