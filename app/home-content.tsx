"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Layout, Space, Typography, message } from "antd";
import {
  type AccessMode,
  type DepartmentResponse,
  deleteDepartment,
  deleteProject,
  type ProjectResponse,
  HttpError,
} from "@/lib/management-api";
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
import {
  canCreateDepartment,
  canCreateProject,
  canDeleteDepartment,
  canManageProjectByDepartment,
  canUpdateDepartment,
} from "@/features/dashboard/lib/permissions";
import { TABLE_PAGE_SIZE_DEFAULT } from "@/lib/table-pagination";
import { DepartmentDetailCard } from "@/features/dashboard/components/department-detail-card";
import { DepartmentTable } from "@/features/dashboard/components/department-table";
import { ProjectDetailCard } from "@/features/dashboard/components/project-detail-card";
import { ProjectTable } from "@/features/dashboard/components/project-table";
import { toViewModeRoute } from "@/features/dashboard/model/view-modes";
import { CommonLeftbar } from "./common-leftbar";
import { HomeHeader } from "./home-header";

type ViewMode = "department" | "project";

type HomeContentProps = {
  initialFullName: string;
  initialAccessMode: AccessMode;
  viewMode: ViewMode;
  selectedDepartmentId?: number;
  selectedProjectId?: number;
};

function getHttpErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) {
    return "Unexpected error";
  }

  return `${error.status}: ${error.message}`;
}

export function HomeContent({
  initialFullName,
  initialAccessMode,
  viewMode,
  selectedDepartmentId: initialSelectedDepartmentId,
  selectedProjectId: initialSelectedProjectId,
}: HomeContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(initialSelectedDepartmentId);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(initialSelectedProjectId);
  const [departmentPagination, setDepartmentPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });
  const [projectPagination, setProjectPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });

  const {
    fullName,
    accessMode,
    availableViewModes,
    departments,
    projects,
    managedDepartmentIds,
    currentUserError,
    departmentsError,
    projectsError,
    isProfileLoading,
  } = useDashboardContext({
    initialFullName,
    initialAccessMode,
  });
  const { projectScope, headerTabs, activeHeaderTabKey, onHeaderTabChange } = useProjectScope(accessMode);

  useAutoSignOutOnUnauthorized([currentUserError, departmentsError, projectsError]);

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: async (_, deletedDeptId) => {
      queryClient.setQueryData<DepartmentResponse[]>(["departments"], (previous) =>
        (previous ?? []).filter((department) => department.partId !== deletedDeptId),
      );

      if (selectedDepartmentId === deletedDeptId) {
        setSelectedDepartmentId(undefined);
      }

      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      message.success("Department deleted");
      router.push("/departments");
      router.refresh();
    },
    onError: (error) => {
      message.error(`Delete department failed: ${getHttpErrorMessage(error)}`);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async (_, deletedProjectId) => {
      queryClient.setQueryData<ProjectResponse[]>(["projects"], (previous) =>
        (previous ?? []).filter((project) => project.id !== deletedProjectId),
      );

      if (selectedProjectId === deletedProjectId) {
        setSelectedProjectId(undefined);
      }

      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      message.success("Project deleted");
      router.push("/projects");
      router.refresh();
    },
    onError: (error) => {
      message.error(`Delete project failed: ${getHttpErrorMessage(error)}`);
    },
  });

  const myProjects = useMemo(() => getManagedProjects(projects, managedDepartmentIds), [projects, managedDepartmentIds]);
  const displayedProjects = useMemo(
    () => getDisplayedProjects(projects, myProjects, projectScope),
    [projectScope, myProjects, projects],
  );

  const selectedDepartment = departments.find((department) => department.partId === selectedDepartmentId);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  useEffect(() => {
    setSelectedDepartmentId(initialSelectedDepartmentId);
  }, [initialSelectedDepartmentId]);

  useEffect(() => {
    setSelectedProjectId(initialSelectedProjectId);
  }, [initialSelectedProjectId]);

  useEffect(() => {
    if (availableViewModes.length === 0) {
      return;
    }

    if (!availableViewModes.some((mode) => mode === viewMode)) {
      router.replace(toViewModeRoute(availableViewModes[0]));
    }
  }, [availableViewModes, router, viewMode]);

  function canEditProjectData(project: ProjectResponse) {
    return canManageProjectByDepartment(accessMode, managedDepartmentIds, project.departmentId);
  }

  function canDeleteProjectData(project: ProjectResponse) {
    return canManageProjectByDepartment(accessMode, managedDepartmentIds, project.departmentId);
  }

  function goToCreateRoute() {
    if (viewMode === "department") {
      if (!canCreateDepartment(accessMode)) {
        message.error("Forbidden (403): You do not have permission to create department.");
        return;
      }

      router.push("/departments/create");
      return;
    }

    if (!canCreateProject(accessMode)) {
      message.error("Forbidden (403): You do not have permission to create project.");
      return;
    }

    router.push(
      buildProjectCreateRoute({
        accessMode,
        selectedDepartmentId,
        managedDepartmentIds,
        departments,
      }),
    );
  }

  function handleLeftbarSelect(id: number) {
    if (viewMode === "project") {
      const project = displayedProjects.find((item) => item.id === id);
      if (!project) {
        return;
      }

      router.push(`/projects/${project.id}`, { scroll: false });
      return;
    }

    router.push(`/departments/${id}`);
  }

  function renderProjectDetail(project: ProjectResponse) {
    const projectDepartmentName =
      departments.find((department) => department.partId === project.departmentId)?.partName ?? "-";

    return (
      <ProjectDetailCard
        project={project}
        projectDepartmentName={projectDepartmentName}
        canEdit={canEditProjectData(project)}
        canDelete={canDeleteProjectData(project)}
        deletePending={deleteProjectMutation.isPending}
        onEdit={() => router.push(`/projects/${project.id}/edit`)}
        onDelete={() => deleteProjectMutation.mutate(project.id)}
      />
    );
  }

  function renderDepartmentDetail(department: DepartmentResponse) {
    return (
      <DepartmentDetailCard
        department={department}
        canUpdate={canUpdateDepartment(accessMode)}
        canDelete={canDeleteDepartment(accessMode)}
        deletePending={deleteDepartmentMutation.isPending}
        onEdit={() => router.push(`/departments/${department.partId}/edit`)}
        onDelete={() => deleteDepartmentMutation.mutate(department.partId)}
      />
    );
  }

  const leftbarItems =
    viewMode === "project"
      ? buildProjectLeftbarItems(displayedProjects)
      : buildDepartmentLeftbarItems(departments);

  const activeLeftbarId = viewMode === "project" ? selectedProjectId : selectedDepartmentId;

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
            className={`app-sidebar h-full overflow-hidden border-r border-slate-200 transition-all duration-200 ${
              isSidebarCollapsed ? "w-0 border-r-0 p-0" : "w-80 p-3"
            }`}
          >
            {isSidebarCollapsed ? null : (
              <CommonLeftbar
                title={viewMode === "project" ? "Project List" : "Department List"}
                items={leftbarItems}
                activeKey={activeLeftbarId}
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

          <main ref={mainScrollRef} className="h-full min-w-0 flex-1 overflow-y-auto p-6">
            <Space direction="vertical" className="w-full" size="middle">
              {isProfileLoading ? <Alert type="info" showIcon message="Loading profile..." /> : null}
              {currentUserError instanceof HttpError ? (
                <Alert
                  type="error"
                  showIcon
                  message={`Profile error ${currentUserError.status}: ${currentUserError.message}`}
                />
              ) : null}

              {viewMode === "project" && selectedProject ? renderProjectDetail(selectedProject) : null}

              {viewMode === "department" && selectedDepartment ? renderDepartmentDetail(selectedDepartment) : null}

              {((viewMode === "project" && !selectedProject) ||
                (viewMode === "department" && !selectedDepartment)) ? (
                <Card className="shadow-sm">
                  <Typography.Title level={4} className="!mb-3">
                    {viewMode === "department" ? "Department List" : "Project List"}
                  </Typography.Title>

                  {(viewMode === "department" ? departments.length : displayedProjects.length) === 0 ? (
                    <Empty
                      description={
                        viewMode === "project"
                          ? "No projects available."
                          : "No departments available."
                      }
                    >
                      {(viewMode === "department"
                        ? canCreateDepartment(accessMode)
                        : canCreateProject(accessMode)) ? (
                        <Button type="primary" onClick={goToCreateRoute}>
                          {viewMode === "department" ? "Create Department" : "Create Project"}
                        </Button>
                      ) : null}
                    </Empty>
                  ) : (
                    <>
                      {viewMode === "department" ? (
                        <DepartmentTable
                          departments={departments}
                          pagination={departmentPagination}
                          onPaginationChange={setDepartmentPagination}
                          onRowSelect={handleLeftbarSelect}
                          getStickyContainer={() => mainScrollRef.current ?? document.body}
                        />
                      ) : (
                        <ProjectTable
                          projects={displayedProjects}
                          pagination={projectPagination}
                          onPaginationChange={setProjectPagination}
                          onRowSelect={handleLeftbarSelect}
                          getStickyContainer={() => mainScrollRef.current ?? document.body}
                        />
                      )}
                    </>
                  )}
                </Card>
              ) : null}
            </Space>
          </main>
        </div>
      </Layout.Content>
    </Layout>
  );
}
