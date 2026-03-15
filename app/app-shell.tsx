"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Layout, Space } from "antd";
import { signOut } from "next-auth/react";
import { type AccessMode, getCurrentUser, getDepartments, getProjects, HttpError } from "@/lib/management-api";
import { CommonLeftbar } from "./common-leftbar";
import { HomeHeader } from "./home-header";

type ViewMode = "department" | "project";

type AppShellProps = {
  initialFullName: string;
  initialAccessMode: AccessMode;
  viewMode: ViewMode;
  children: React.ReactNode;
};

function getAvailableViewModes(accessMode: AccessMode) {
  if (accessMode === "ADMIN") {
    return ["department", "project"] as const;
  }

  if (accessMode === "PIC") {
    return ["department", "project"] as const;
  }

  if (accessMode === "PM") {
    return ["project"] as const;
  }

  return [] as const;
}

export function AppShell({ initialFullName, initialAccessMode, viewMode, children }: AppShellProps) {
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
  const accessMode = currentUser?.accessMode ?? initialAccessMode;
  const availableViewModes = getAvailableViewModes(accessMode);

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
            department.departmentPicUsername == null
              ? "PIC: Unassigned"
              : `PIC User: ${department.departmentPicUsername}`,
        }));

  useEffect(() => {
    const errors = [currentUserError, departmentsQuery.error, projectsQuery.error]
      .filter((entry): entry is HttpError => entry instanceof HttpError)
      .some((entry) => entry.status === 401);

    if (errors) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [currentUserError, departmentsQuery.error, projectsQuery.error]);

  useEffect(() => {
    if (availableViewModes.length === 0) {
      return;
    }

    if (!availableViewModes.some((mode) => mode === viewMode)) {
      router.replace(availableViewModes[0] === "department" ? "/departments" : "/projects");
    }
  }, [availableViewModes, router, viewMode]);

  function canCreateDepartment() {
    return accessMode === "ADMIN";
  }

  function canCreateProject() {
    return accessMode === "PIC";
  }

  function goToCreateRoute() {
    if (viewMode === "department") {
      router.push("/departments/create");
      return;
    }

    const defaultDepartmentId = departments[0]?.partId;
    const deptQuery = defaultDepartmentId ? `?deptId=${defaultDepartmentId}` : "";
    router.push(`/projects/create${deptQuery}`);
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
        accessMode={accessMode}
        viewMode={viewMode}
        availableViewModes={[...availableViewModes]}
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
