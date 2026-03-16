import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { resolveAccessMode } from "@/lib/auth-helpers";
import { AppShell } from "@/app/app-shell";
import { ProjectEditForm } from "@/features/projects/components/project-edit-form";

type RouteProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectEditPage({ params }: RouteProps) {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  const { projectId } = await params;
  const numericProjectId = Number(projectId);

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={resolveAccessMode(session.role)}
      viewMode="project"
    >
      <ProjectEditForm projectId={Number.isFinite(numericProjectId) ? numericProjectId : -1} />
    </AppShell>
  );
}
