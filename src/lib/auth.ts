import { NextRequest } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("access_token")?.value;

    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(
  handler: (req: NextRequest, user: JWTPayload) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }
    return handler(req, user);
  };
}

export function requireRole(
  roles: string[],
  handler: (req: NextRequest, user: JWTPayload) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!roles.includes(user.role)) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }
    return handler(req, user);
  };
}