export async function POST() {
  const response = Response.json({ message: "Déconnecté" });
  response.headers.append(
    "Set-Cookie",
    "access_token=; Path=/; Max-Age=0; SameSite=Lax"
  );
  return response;
}