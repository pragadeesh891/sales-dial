import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  let user = mockDb.users[0]; // Default to Manager for demo if token not parsed
  if (token.includes("usr-")) {
    const userId = token.split("mock-jwt-token-")[1];
    const found = mockDb.users.find(u => u.id === userId);
    if (found) user = found;
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    }
  });
}
