import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/");
  }

  return <LoginForm />;
}