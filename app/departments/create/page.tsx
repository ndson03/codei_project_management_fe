import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { AppShell } from "@/app/app-shell";
import { DepartmentCreateForm } from "./department-create-form";

export default async function DepartmentCreatePage() {
  const session = await getServerAuthSession();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  return (
    <AppShell
      initialFullName={session.user?.name ?? "Unknown User"}
      initialAccessMode={session.role === "ROLE_ADMIN" ? "ADMIN" : "NONE"}
      viewMode="department"
    >
      <DepartmentCreateForm />
    </AppShell>
  );
}
