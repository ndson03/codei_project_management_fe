import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { AppShell } from "@/app/app-shell";
import { ProjectCreateForm } from "./project-create-form";

export default async function ProjectCreatePage() {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialRole={session.role ?? "N/A"}
      viewMode="project"
    >
      <ProjectCreateForm />
    </AppShell>
  );
}
