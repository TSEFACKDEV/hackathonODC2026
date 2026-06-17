import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    const where: any = { isActive: true };
    if (zone) where.zone = { contains: zone };

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { zone: "asc" },
    });

    return Response.json({ data: schedules });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = requireRole(["ADMIN"], async (req, user) => {
  try {
    const body = await req.json();
    const { title, description, zone, frequency, dayOfWeek, timeSlot } = body;

    if (!title || !zone || !frequency || !timeSlot) {
      return Response.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const schedule = await prisma.schedule.create({
      data: { title, description, zone, frequency, dayOfWeek, timeSlot },
    });

    return Response.json({ data: schedule }, { status: 201 });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});