import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: any = {};
    if (status && status !== "ALL") where.status = status;

    const collections = await prisma.collection.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        agent: { select: { id: true, name: true, avatar: true } },
        points: { orderBy: { order: "asc" } },
      },
    });

    return Response.json({ data: collections });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = requireRole(["AGENT", "ADMIN"], async (req, user) => {
  try {
    const body = await req.json();
    const { title, description, date, points: routePoints } = body;

    if (!title || !date || !routePoints?.length) {
      return Response.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const optimized = optimizeRoute(routePoints);
    const distance = calcDistance(optimized);
    const carbonSaved = parseFloat((distance * 0.21).toFixed(2));

    const collection = await prisma.collection.create({
      data: {
        agentId: user.userId,
        title,
        description: description || null,
        date: new Date(date),
        distance,
        carbonSaved,
        points: {
          create: optimized.map((p: any, i: number) => ({
            latitude: parseFloat(String(p.latitude)),
            longitude: parseFloat(String(p.longitude)),
            address: p.address || null,
            signalId: p.signalId || null,
            order: i + 1,
          })),
        },
      },
      include: {
        agent: { select: { id: true, name: true } },
        points: { orderBy: { order: "asc" } },
      },
    });

    return Response.json({ data: collection, message: "Itinéraire créé ✅" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

// Nearest Neighbor TSP
function optimizeRoute(pts: any[]) {
  if (pts.length <= 2) return pts;
  const visited = new Set<number>();
  const result = [pts[0]];
  visited.add(0);
  for (let i = 1; i < pts.length; i++) {
    const last = result[result.length - 1];
    let best = -1, bestD = Infinity;
    pts.forEach((p, j) => {
      if (!visited.has(j)) {
        const d = haversine(last.latitude, last.longitude, p.latitude, p.longitude);
        if (d < bestD) { bestD = d; best = j; }
      }
    });
    if (best !== -1) { result.push(pts[best]); visited.add(best); }
  }
  return result;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcDistance(pts: any[]) {
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++) d += haversine(pts[i].latitude, pts[i].longitude, pts[i + 1].latitude, pts[i + 1].longitude);
  return parseFloat(d.toFixed(2));
}