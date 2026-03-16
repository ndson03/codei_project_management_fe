import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { HomeContent } from "../../home-content";

type RouteProps = {
  params: Promise<{
    partId: string;
  }>;
};

export default async function DepartmentDetailPage({ params }: RouteProps) {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  const { partId } = await params;
  const numericPartId = Number(partId);

  return (
    <HomeContent
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={session.role === "ROLE_ADMIN" ? "ADMIN" : "USER"}
      viewMode="department"
      selectedDepartmentId={Number.isFinite(numericPartId) ? numericPartId : undefined}
    />
  );
}
