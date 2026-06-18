import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const PUT = requireRole(["ADMIN"], async (req) => {
  const id = req.url.split("/api/schedule/")[1].split("/")[0];
  try {
    const body = await req.json();
    const item = await prisma.schedule.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        zone: body.zone,
        frequency: body.frequency,
        dayOfWeek: body.dayOfWeek != null ? parseInt(String(body.dayOfWeek)) : null,
        timeSlot: body.timeSlot,
        isActive: body.isActive,
      },
    });
    return Response.json({ data: item, message: "Planning mis à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

export const DELETE = requireRole(["ADMIN"], async (req) => {
  const id = req.url.split("/api/schedule/")[1].split("/")[0];
  try {
    await prisma.schedule.delete({ where: { id } });
    return Response.json({ message: "Planning supprimé" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});