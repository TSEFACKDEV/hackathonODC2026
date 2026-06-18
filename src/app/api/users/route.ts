import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const GET = requireRole(["ADMIN"], async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role && role !== "ALL") where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, points: true, credits: true, totalPoints: true,
          isVerified: true, isActive: true, createdAt: true,
          _count: { select: { signals: true, activities: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return Response.json({ data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
});