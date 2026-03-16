import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { resolveAccessMode } from "@/lib/auth-helpers";
import { AppShell } from "@/app/app-shell";
import { ProjectCreateForm } from "@/features/projects/components/project-create-form";

export default async function ProjectCreatePage() {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={resolveAccessMode(session.role)}
      viewMode="project"
    >
      <ProjectCreateForm />
    </AppShell>
  );
}
