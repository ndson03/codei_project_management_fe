import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  redirect(session.role === "ROLE_ADMIN" ? "/departments" : "/projects");
}
