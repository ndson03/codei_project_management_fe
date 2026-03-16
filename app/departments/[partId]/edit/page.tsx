import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { resolveAccessMode } from "@/lib/auth-helpers";
import { AppShell } from "@/app/app-shell";
import { DepartmentEditForm } from "@/features/departments/components/department-edit-form";

type RouteProps = {
  params: Promise<{
    partId: string;
  }>;
};

export default async function DepartmentEditPage({ params }: RouteProps) {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  const { partId } = await params;
  const numericPartId = Number(partId);

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={resolveAccessMode(session.role)}
      viewMode="department"
    >
      <DepartmentEditForm partId={Number.isFinite(numericPartId) ? numericPartId : -1} />
    </AppShell>
  );
}
