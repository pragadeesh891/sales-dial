import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { hasSession, getSessionRole } from "@/lib/auth/session";

export default async function HomePage() {
  if (await hasSession()) {
    const role = await getSessionRole();
    if (role === "admin") {
      redirect("/manager");
    } else {
      redirect("/salesperson");
    }
  }

  return <LoginScreen />;
}
