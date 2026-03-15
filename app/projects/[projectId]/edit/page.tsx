import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { AppShell } from "@/app/app-shell";
import { ProjectEditForm } from "./project-edit-form";

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
      initialAccessMode={session.role === "ROLE_ADMIN" ? "ADMIN" : "NONE"}
      viewMode="project"
    >
      <ProjectEditForm projectId={Number.isFinite(numericProjectId) ? numericProjectId : -1} />
    </AppShell>
  );
}
