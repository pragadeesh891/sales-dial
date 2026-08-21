import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Allow fallback login for demo purposes if email is manager/agent format
      const isManager = email.includes("manager") || email.includes("admin");
      const newUser = {
        id: `usr-${Date.now()}`,
        name: isManager ? "Sales Manager" : "Sales Representative",
        email: email,
        role: (isManager ? "admin" : "agent") as "admin" | "agent",
        status: "available" as const
      };
      mockDb.users.push(newUser);

      return NextResponse.json({
        success: true,
        data: {
          access_token: `mock-jwt-token-${newUser.id}`,
          refresh_token: `mock-refresh-token-${newUser.id}`,
          role: newUser.role,
          user: newUser
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        access_token: `mock-jwt-token-${user.id}`,
        refresh_token: `mock-refresh-token-${user.id}`,
        role: user.role,
        user: user
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid login credentials" }, { status: 400 });
  }
}
