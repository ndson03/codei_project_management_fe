"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Layout, Space } from "antd";
import { signOut } from "next-auth/react";
import { type AccessMode, getCurrentUser, getDepartments, getProjects, HttpError } from "@/lib/management-api";
import { CommonLeftbar } from "./common-leftbar";
import { HomeHeader } from "./home-header";

type ViewMode = "department" | "project" | "statistics";

type AppShellProps = {
  initialFullName: string;
  initialAccessMode: AccessMode;
  viewMode: ViewMode;
  children: React.ReactNode;
};

function getAvailableViewModes(accessMode: AccessMode) {
  if (accessMode === "ADMIN") {
    return ["department", "project", "statistics"] as const;
  }

  return ["project", "statistics"] as const;
}

export function AppShell({ initialFullName, initialAccessMode, viewMode, children }: AppShellProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projectScope, setProjectScope] = useState<"my" | "all">("all");

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
  const availableViewModes = useMemo(() => {
    const baseModes = [...getAvailableViewModes(accessMode)];

    if (accessMode === "ADMIN") {
      return ["department", ...baseModes.filter((mode) => mode !== "department")] as const;
    }

    if (currentUser?.departmentPicPartIds?.length) {
      return ["department", ...baseModes.filter((mode) => mode !== "department")] as const;
    }

    return baseModes;
  }, [accessMode, currentUser?.departmentPicPartIds]);

  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const managedDepartmentIds = useMemo(() => currentUser?.departmentPicPartIds ?? [], [currentUser?.departmentPicPartIds]);
  const myProjects = useMemo(
    () => projects.filter((project) => managedDepartmentIds.includes(project.departmentId)),
    [projects, managedDepartmentIds],
  );
  const displayedProjects = useMemo(
    () => (projectScope === "my" ? myProjects : projects),
    [projectScope, myProjects, projects],
  );

  const leftbarItems =
    viewMode === "project"
      ? displayedProjects.map((project) => ({
          key: project.id,
          title: project.projectName,
          subtitle: project.pics.length ? `PICs: ${project.pics.join(", ")}` : "PICs: -",
        }))
      : departments.map((department) => ({
          key: department.partId,
          title: department.partName,
          subtitle:
            !department.departmentPicUsernames?.length
              ? "PIC: Unassigned"
              : `PIC Users: ${department.departmentPicUsernames.join(", ")}`,
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
      router.replace(
        availableViewModes[0] === "department"
          ? "/departments"
          : availableViewModes[0] === "project"
            ? "/projects"
            : "/statistics",
      );
    }
  }, [availableViewModes, router, viewMode]);

  useEffect(() => {
    if (accessMode === "PIC") {
      const savedScope = window.sessionStorage.getItem("project-scope");
      if (savedScope === "my" || savedScope === "all") {
        setProjectScope(savedScope);
        return;
      }
      setProjectScope("all");
      return;
    }

    setProjectScope("all");
  }, [accessMode]);

  const showSidebar = viewMode !== "statistics";

  function canCreateDepartment() {
    return accessMode === "ADMIN";
  }

  function canCreateProject() {
    return accessMode === "ADMIN" || accessMode === "PIC";
  }

  function goToCreateRoute() {
    if (viewMode === "department") {
      router.push("/departments/create");
      return;
    }

    const defaultDepartmentId =
      (accessMode === "PIC" ? managedDepartmentIds[0] : undefined) ?? departments[0]?.partId;
    const deptQuery = defaultDepartmentId ? `?deptId=${defaultDepartmentId}` : "";
    router.push(`/projects/create${deptQuery}`);
  }

  function handleLeftbarSelect(id: number) {
    if (viewMode === "department") {
      router.push(`/departments/${id}`);
      return;
    }

    const project = displayedProjects.find((item) => item.id === id);
    if (!project) {
      return;
    }

    router.push(`/projects/${project.id}`, { scroll: false });
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
            className={`app-sidebar h-full overflow-y-auto border-r border-slate-200 transition-all duration-200 ${
              !showSidebar || isSidebarCollapsed ? "w-0 border-r-0 p-0" : "w-80 p-3"
            }`}
          >
            {!showSidebar || isSidebarCollapsed ? null : (
              <CommonLeftbar
                title={viewMode === "project" ? "Project List" : "Department List"}
                items={leftbarItems}
                onSelect={handleLeftbarSelect}
                emptyText={viewMode === "project" ? "No projects found" : "No departments found"}
                headerTabs={
                  viewMode === "project" && accessMode === "PIC"
                    ? [
                        { key: "my", label: "My Project" },
                        { key: "all", label: "All Project" },
                      ]
                    : undefined
                }
                activeHeaderTabKey={viewMode === "project" && accessMode === "PIC" ? projectScope : undefined}
                onHeaderTabChange={
                  viewMode === "project" && accessMode === "PIC"
                    ? (key) => {
                        const nextScope = key === "my" ? "my" : "all";
                        setProjectScope(nextScope);
                        window.sessionStorage.setItem("project-scope", nextScope);
                      }
                    : undefined
                }
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
              {!isProfileLoading && children}
            </Space>
          </main>
        </div>
      </Layout.Content>
    </Layout>
  );
}
