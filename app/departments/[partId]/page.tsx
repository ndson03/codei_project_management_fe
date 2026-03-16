import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { resolveAccessMode } from "@/lib/auth-helpers";
import { AppShell } from "@/app/app-shell";
import { DepartmentView } from "@/features/dashboard/components/department-view";

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
  const selectedId = Number.isFinite(numericPartId) ? numericPartId : undefined;

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={resolveAccessMode(session.role)}
      viewMode="department"
      activeKey={selectedId}
    >
      <DepartmentView selectedDepartmentId={selectedId} />
    </AppShell>
  );
}
