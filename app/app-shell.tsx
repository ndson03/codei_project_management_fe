"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Layout, Space } from "antd";
import { signOut } from "next-auth/react";
import { getCurrentUser, getDepartments, getProjects, HttpError } from "@/lib/management-api";
import { CommonLeftbar } from "./common-leftbar";
import { HomeHeader } from "./home-header";

type ViewMode = "department" | "project";

type AppShellProps = {
  initialFullName: string;
  initialRole: string;
  viewMode: ViewMode;
  children: React.ReactNode;
};

function normalizeRole(rawRole: string | undefined) {
  if (!rawRole) {
    return "";
  }

  const upper = rawRole.trim().toUpperCase();
  return upper.startsWith("ROLE_") ? upper.slice(5) : upper;
}

export function AppShell({ initialFullName, initialRole, viewMode, children }: AppShellProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { data: currentUser, error: currentUserError, isLoading: isProfileLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const fullName = currentUser?.fullname ?? initialFullName;
  const role = normalizeRole(currentUser?.role ?? initialRole);

  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);

  const leftbarItems =
    viewMode === "project"
      ? projects.map((project) => ({
          key: project.id,
          title: project.projectName,
          subtitle: `Branch: ${project.branch || "-"}`,
        }))
      : departments.map((department) => ({
          key: department.partId,
          title: department.partName,
          subtitle:
            department.departmentPicUserId == null
              ? "PIC: Unassigned"
              : `PIC User: ${department.departmentPicUserId}`,
        }));

  useEffect(() => {
    const errors = [currentUserError, departmentsQuery.error, projectsQuery.error]
      .filter((entry): entry is HttpError => entry instanceof HttpError)
      .some((entry) => entry.status === 401);

    if (errors) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [currentUserError, departmentsQuery.error, projectsQuery.error]);

  function canCreateDepartment() {
    return role === "ADMIN";
  }

  function canCreateProject() {
    return role === "DEPT_PIC";
  }

  function goToCreateRoute() {
    if (viewMode === "department") {
      router.push("/departments/create");
      return;
    }

    router.push("/projects/create");
  }

  function handleLeftbarSelect(id: number) {
    if (viewMode === "department") {
      router.push(`/departments/${id}`);
      return;
    }

    router.push(`/projects/${id}`);
  }

  return (
    <Layout className="h-screen overflow-hidden bg-slate-100">
      <HomeHeader
        fullName={fullName}
        role={role}
        viewMode={viewMode}
        sidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <Layout.Content className="!h-full !p-0 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          <aside
            className={`h-full overflow-y-auto border-r border-slate-200 bg-white transition-all duration-200 ${
              isSidebarCollapsed ? "w-0 border-r-0 p-0" : "w-80 p-3"
            }`}
          >
            {isSidebarCollapsed ? null : (
              <CommonLeftbar
                title={viewMode === "project" ? "Project List" : "Department List"}
                items={leftbarItems}
                onSelect={handleLeftbarSelect}
                emptyText={viewMode === "project" ? "No projects found" : "No departments found"}
                onCreate={viewMode === "project" ? (canCreateProject() ? goToCreateRoute : undefined) : (canCreateDepartment() ? goToCreateRoute : undefined)}
              />
            )}
          </aside>

          <main className="h-full min-w-0 flex-1 overflow-y-auto p-6">
            <Space direction="vertical" className="w-full" size="middle">
              {isProfileLoading ? <Alert type="info" showIcon message="Loading profile..." /> : null}
              {currentUserError instanceof HttpError ? (
                <Alert
                  type="error"
                  showIcon
                  message={`Profile error ${currentUserError.status}: ${currentUserError.message}`}
                />
              ) : null}
              {children}
            </Space>
          </main>
        </div>
      </Layout.Content>
    </Layout>
  );
}
