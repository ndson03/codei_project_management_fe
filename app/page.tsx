import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { HomeContent } from "./home-content";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  return (
    <HomeContent
      username={session.user?.name ?? "N/A"}
      role={session.role ?? "N/A"}
      tokenType={session.tokenType ?? "Bearer"}
      accessToken={session.accessToken}
    />
  );
}
