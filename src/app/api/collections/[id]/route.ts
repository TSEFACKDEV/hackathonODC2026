import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const PATCH = requireRole(["AGENT", "ADMIN"], async (req) => {
  const id = req.url.split("/api/collections/")[1].split("/")[0];
  try {
    const body = await req.json();
    const collection = await prisma.collection.update({
      where: { id },
      data: { status: body.status },
    });
    return Response.json({ data: collection, message: "Statut mis à jour" });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});