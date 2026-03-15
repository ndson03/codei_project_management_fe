import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { HomeContent } from "../home-content";

export default async function DepartmentsPage() {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  return (
    <HomeContent
      initialFullName={session.user?.name ?? "Unknown User"}
      initialRole={session.role ?? "N/A"}
      viewMode="department"
    />
  );
}
