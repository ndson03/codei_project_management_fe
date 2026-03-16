import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { resolveAccessMode } from "@/lib/auth-helpers";
import { AppShell } from "@/app/app-shell";
import { ProjectView } from "@/features/dashboard/components/project-view";

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
  const selectedId = Number.isFinite(numericProjectId) ? numericProjectId : undefined;

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={resolveAccessMode(session.role)}
      viewMode="project"
      activeKey={selectedId}
    >
      <ProjectView selectedProjectId={selectedId} />
    </AppShell>
  );
}
