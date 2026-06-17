import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: any = {};
    if (status) where.status = status;

    const collections = await prisma.collection.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        agent: { select: { id: true, name: true, avatar: true } },
        points: { orderBy: { order: "asc" } },
      },
    });

    return Response.json({ data: collections });

  } catch (error) {
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

    // Algorithme TSP simplifié : nearest neighbor
    const optimizedPoints = optimizeRoute(routePoints);

    // Calcul distance et CO2
    const distance = calculateTotalDistance(optimizedPoints);
    const carbonSaved = distance * 0.21; // 210g CO2/km pour camion diesel

    const collection = await prisma.collection.create({
      data: {
        agentId: user.userId,
        title,
        description,
        date: new Date(date),
        distance,
        carbonSaved,
        points: {
          create: optimizedPoints.map((p: any, i: number) => ({
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
            signalId: p.signalId,
            order: i + 1,
          })),
        },
      },
      include: { points: true },
    });

    return Response.json({ data: collection, message: "Itinéraire créé" }, { status: 201 });

  } catch (error) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

// Algorithme nearest neighbor pour TSP
function optimizeRoute(points: any[]) {
  if (points.length <= 2) return points;

  const visited = new Array(points.length).fill(false);
  const result = [points[0]];
  visited[0] = true;

  for (let i = 1; i < points.length; i++) {
    const last = result[result.length - 1];
    let nearest = -1, minDist = Infinity;

    for (let j = 0; j < points.length; j++) {
      if (!visited[j]) {
        const d = haversineDistance(last.latitude, last.longitude, points[j].latitude, points[j].longitude);
        if (d < minDist) { minDist = d; nearest = j; }
      }
    }

    if (nearest !== -1) { result.push(points[nearest]); visited[nearest] = true; }
  }

  return result;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calculateTotalDistance(points: any[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineDistance(points[i].latitude, points[i].longitude, points[i+1].latitude, points[i+1].longitude);
  }
  return Math.round(total * 100) / 100;
}