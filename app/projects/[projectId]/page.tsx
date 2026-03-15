import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { HomeContent } from "../../home-content";

type RouteProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({ params }: RouteProps) {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  const { projectId } = await params;
  const numericProjectId = Number(projectId);

  return (
    <HomeContent
      initialFullName={session.user?.name ?? "Unknown User"}
      initialRole={session.role ?? "N/A"}
      viewMode="project"
      selectedProjectId={Number.isFinite(numericProjectId) ? numericProjectId : undefined}
    />
  );
}
