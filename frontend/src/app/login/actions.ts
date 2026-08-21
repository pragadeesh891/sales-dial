"use server";

import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth/session";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const isManager = email.toLowerCase().includes("manager") || email.toLowerCase().includes("admin");
  const role = isManager ? "admin" : "agent";

  await setSession({
    accessToken: `mock-token-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    role: role,
  });

  if (isManager) {
    redirect("/manager");
  } else {
    redirect("/salesperson");
  }
}
