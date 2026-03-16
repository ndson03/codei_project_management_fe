"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Layout, Space } from "antd";
import { type AccessMode, HttpError } from "@/lib/management-api";
import { useAutoSignOutOnUnauthorized } from "@/features/dashboard/hooks/use-auto-signout-on-unauthorized";
import { useDashboardContext } from "@/features/dashboard/hooks/use-dashboard-context";
import { useProjectScope } from "@/features/dashboard/hooks/use-project-scope";
import {
  buildDepartmentLeftbarItems,
  buildProjectLeftbarItems,
  getDisplayedProjects,
  getManagedProjects,
} from "@/features/dashboard/lib/leftbar-items";
import { buildProjectCreateRoute } from "@/features/dashboard/lib/navigation";
import { canCreateDepartment, canCreateProject } from "@/features/dashboard/lib/permissions";
import { toViewModeRoute, type DashboardViewMode } from "@/features/dashboard/model/view-modes";
import { DashboardContext, type DashboardContextValue } from "@/features/dashboard/context/dashboard-context";
import { CommonLeftbar } from "./common-leftbar";
import { HomeHeader } from "./home-header";

type ViewMode = DashboardViewMode;

type AppShellProps = {
  initialFullName: string;
  initialAccessMode: AccessMode;
  viewMode: ViewMode;
  activeKey?: number;
  children: React.ReactNode;
};

export function AppShell({ initialFullName, initialAccessMode, viewMode, activeKey, children }: AppShellProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const dashboardState = useDashboardContext({ initialFullName, initialAccessMode });
  const {
    fullName,
    accessMode,
    departments,
    projects,
    managedDepartmentIds,
    availableViewModes,
    currentUserError,
    departmentsError,
    projectsError,
    isProfileLoading,
  } = dashboardState;

  useAutoSignOutOnUnauthorized([currentUserError, departmentsError, projectsError]);

  const projectScopeState = useProjectScope(accessMode);
  const { projectScope, headerTabs, activeHeaderTabKey, onHeaderTabChange } = projectScopeState;

  const myProjects = useMemo(() => getManagedProjects(projects, managedDepartmentIds), [projects, managedDepartmentIds]);
  const displayedProjects = useMemo(
    () => getDisplayedProjects(projects, myProjects, projectScope),
    [projectScope, myProjects, projects],
  );

  const contextValue: DashboardContextValue = {
    ...dashboardState,
    projectScope,
    headerTabs,
    activeHeaderTabKey,
    onHeaderTabChange,
  };

  const leftbarItems =
    viewMode === "project"
      ? buildProjectLeftbarItems(displayedProjects)
      : buildDepartmentLeftbarItems(departments);

  useEffect(() => {
    if (availableViewModes.length === 0) {
      return;
    }

    if (!availableViewModes.some((mode) => mode === viewMode)) {
      router.replace(toViewModeRoute(availableViewModes[0]));
    }
  }, [availableViewModes, router, viewMode]);

  const showSidebar = viewMode !== "statistics";

  function goToCreateRoute() {
    if (viewMode === "department") {
      router.push("/departments/create");
      return;
    }

    router.push(
      buildProjectCreateRoute({
        accessMode,
        selectedDepartmentId: viewMode === "project" ? activeKey : undefined,
        managedDepartmentIds,
        departments,
      }),
    );
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
    <DashboardContext.Provider value={contextValue}>
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
                  activeKey={activeKey}
                  onSelect={handleLeftbarSelect}
                  emptyText={viewMode === "project" ? "No projects found" : "No departments found"}
                  headerTabs={viewMode === "project" ? headerTabs : undefined}
                  activeHeaderTabKey={viewMode === "project" ? activeHeaderTabKey : undefined}
                  onHeaderTabChange={viewMode === "project" ? onHeaderTabChange : undefined}
                  onCreate={
                    viewMode === "project"
                      ? (canCreateProject(accessMode) ? goToCreateRoute : undefined)
                      : (canCreateDepartment(accessMode) ? goToCreateRoute : undefined)
                  }
                  scrollStorageKey={viewMode === "project" ? "leftbar-scroll-project" : "leftbar-scroll-department"}
                />
              )}
            </aside>

            <main id="app-main-scroll" className="h-full min-w-0 flex-1 overflow-y-auto p-6">
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
    </DashboardContext.Provider>
  );
}
