import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { AppShell } from "@/app/app-shell";
import { DepartmentEditForm } from "./department-edit-form";

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
      initialRole={session.role ?? "N/A"}
      viewMode="department"
    >
      <DepartmentEditForm partId={Number.isFinite(numericPartId) ? numericPartId : -1} />
    </AppShell>
  );
}
