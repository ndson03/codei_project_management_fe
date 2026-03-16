"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Descriptions, Empty, Layout, Popconfirm, Space, Table, Typography, message } from "antd";
import { signOut } from "next-auth/react";
import {
  type AccessMode,
  type DepartmentResponse,
  deleteDepartment,
  deleteProject,
  getCurrentUser,
  getDepartments,
  getProjects,
  type ProjectResponse,
  HttpError,
} from "@/lib/management-api";
import { TABLE_PAGE_SIZE_DEFAULT, TABLE_PAGE_SIZE_OPTIONS } from "@/lib/table-pagination";
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

function getAvailableViewModes(accessMode: AccessMode) {
  if (accessMode === "ADMIN") {
    return ["department", "project", "statistics"] as const;
  }

  return ["project", "statistics"] as const;
}

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
  const [projectScope, setProjectScope] = useState<"my" | "all">("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(initialSelectedDepartmentId);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(initialSelectedProjectId);
  const [departmentPagination, setDepartmentPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });
  const [projectPagination, setProjectPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });

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

  const selectedDepartment = departments.find((department) => department.partId === selectedDepartmentId);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  useEffect(() => {
    const errors = [currentUserError, departmentsQuery.error, projectsQuery.error]
      .filter((entry): entry is HttpError => entry instanceof HttpError)
      .some((entry) => entry.status === 401);

    if (errors) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [currentUserError, departmentsQuery.error, projectsQuery.error]);

  useEffect(() => {
    setSelectedDepartmentId(initialSelectedDepartmentId);
  }, [initialSelectedDepartmentId]);

  useEffect(() => {
    setSelectedProjectId(initialSelectedProjectId);
  }, [initialSelectedProjectId]);

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

  function canCreateDepartment() {
    return accessMode === "ADMIN";
  }

  function canCreateProject() {
    return accessMode === "ADMIN" || accessMode === "PIC";
  }

  function canUpdateDepartment() {
    return accessMode === "ADMIN" || accessMode === "PIC";
  }

  function canDeleteDepartment() {
    return accessMode === "ADMIN";
  }

  function canEditProjectData(project: ProjectResponse) {
    if (accessMode === "ADMIN") {
      return true;
    }

    if (accessMode === "PIC") {
      return managedDepartmentIds.includes(project.departmentId);
    }

    return false;
  }

  function canDeleteProjectData(project: ProjectResponse) {
    if (accessMode === "ADMIN") {
      return true;
    }

    if (accessMode === "PIC") {
      return managedDepartmentIds.includes(project.departmentId);
    }

    return false;
  }

  function goToCreateRoute() {
    if (viewMode === "department") {
      if (!canCreateDepartment()) {
        message.error("Forbidden (403): You do not have permission to create department.");
        return;
      }

      router.push("/departments/create");
      return;
    }

    if (!canCreateProject()) {
      message.error("Forbidden (403): You do not have permission to create project.");
      return;
    }

    const defaultDepartmentId =
      selectedDepartmentId ??
      (accessMode === "PIC" ? managedDepartmentIds[0] : undefined) ??
      departments[0]?.partId;
    const deptQuery = defaultDepartmentId ? `?deptId=${defaultDepartmentId}` : "";
    router.push(`/projects/create${deptQuery}`);
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
      <Card className="shadow-sm">
        <Typography.Title level={4} className="!mb-4">
          Project Detail
        </Typography.Title>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Project Name">{project.projectName}</Descriptions.Item>
          <Descriptions.Item label="PICs">
            {project.pics.length ? project.pics.join(", ") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Part Name">{projectDepartmentName}</Descriptions.Item>
          <Descriptions.Item label="Branch">{project.branch || "-"}</Descriptions.Item>
          <Descriptions.Item label="Notes">{project.notes || "-"}</Descriptions.Item>
          <Descriptions.Item label="Task Managements">
            {project.taskManagements.length ? project.taskManagements.join(", ") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Repositories">
            {project.repositories.length ? project.repositories.join(", ") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Dev White List">
            {project.devWhiteList.length ? project.devWhiteList.join(", ") : "-"}
          </Descriptions.Item>
        </Descriptions>

        {canEditProjectData(project) ? (
          <div className="mt-6">
            <Space wrap>
              <Button onClick={() => router.push(`/projects/${project.id}/edit`)}>
                Edit Project Data
              </Button>

              {canDeleteProjectData(project) ? (
                <Popconfirm
                  title="Delete this project?"
                  description="This action cannot be undone."
                  okText="Delete"
                  okButtonProps={{ danger: true, loading: deleteProjectMutation.isPending }}
                  onConfirm={() => deleteProjectMutation.mutate(project.id)}
                >
                  <Button danger>Delete Project</Button>
                </Popconfirm>
              ) : null}
            </Space>
          </div>
        ) : null}
      </Card>
    );
  }

  function renderDepartmentDetail(department: DepartmentResponse) {
    return (
      <Card className="shadow-sm">
        <Typography.Title level={4} className="!mb-4">
          Department Detail
        </Typography.Title>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Part Name">{department.partName}</Descriptions.Item>
          <Descriptions.Item label="Department PIC Username">
            {department.departmentPicUsernames?.length
              ? department.departmentPicUsernames.join(", ")
              : "Unassigned"}
          </Descriptions.Item>
          <Descriptions.Item label="Git PAT">{department.gitPat || "-"}</Descriptions.Item>
          <Descriptions.Item label="Ecode PAT">{department.ecodePat || "-"}</Descriptions.Item>
          <Descriptions.Item label="Gerrit Username">{department.gerritUserName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Gerrit HTTP Password">{department.gerritHttpPassword || "-"}</Descriptions.Item>
          <Descriptions.Item label="Jira SEC PAT">{department.jiraSecPat || "-"}</Descriptions.Item>
          <Descriptions.Item label="Jira MX PAT">{department.jiraMxPat || "-"}</Descriptions.Item>
          <Descriptions.Item label="Jira LA PAT">{department.jiraLaPat || "-"}</Descriptions.Item>
        </Descriptions>

        {canUpdateDepartment() ? (
          <div className="mt-6">
            <Space wrap>
              <Button onClick={() => router.push(`/departments/${department.partId}/edit`)}>
                Edit Department
              </Button>

              {canDeleteDepartment() ? (
                <Popconfirm
                  title="Delete this department?"
                  description="This action cannot be undone."
                  okText="Delete"
                  okButtonProps={{ danger: true, loading: deleteDepartmentMutation.isPending }}
                  onConfirm={() => deleteDepartmentMutation.mutate(department.partId)}
                >
                  <Button danger>Delete Department</Button>
                </Popconfirm>
              ) : null}
            </Space>
          </div>
        ) : null}
      </Card>
    );
  }

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
                      {(viewMode === "department" ? canCreateDepartment() : canCreateProject()) ? (
                        <Button type="primary" onClick={goToCreateRoute}>
                          {viewMode === "department" ? "Create Department" : "Create Project"}
                        </Button>
                      ) : null}
                    </Empty>
                  ) : (
                    <>
                      {viewMode === "department" ? (
                        <Table
                          rowKey="partId"
                          size="small"
                          pagination={{
                            current: departmentPagination.current,
                            pageSize: departmentPagination.pageSize,
                            total: departments.length,
                            showSizeChanger: true,
                            pageSizeOptions: [...TABLE_PAGE_SIZE_OPTIONS],
                          }}
                          sticky={{
                            offsetHeader: 0,
                            getContainer: () => mainScrollRef.current ?? document.body,
                          }}
                          dataSource={departments}
                          onChange={(pagination) => {
                            setDepartmentPagination({
                              current: pagination.current ?? 1,
                              pageSize: pagination.pageSize ?? TABLE_PAGE_SIZE_DEFAULT,
                            });
                          }}
                          scroll={{ x: 2000 }}
                          onRow={(record) => ({
                            onClick: () => handleLeftbarSelect(record.partId),
                            className: "cursor-pointer",
                          })}
                          columns={[
                            {
                              title: "Part Name",
                              dataIndex: "partName",
                              width: 180,
                            },
                            {
                              title: "Department PIC Username",
                              dataIndex: "departmentPicUsernames",
                              width: 200,
                              render: (value: string[] | null) =>
                                value && value.length ? value.join(", ") : "Unassigned",
                            },
                            {
                              title: "Git PAT",
                              dataIndex: "gitPat",
                              width: 180,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Ecode PAT",
                              dataIndex: "ecodePat",
                              width: 180,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Gerrit Username",
                              dataIndex: "gerritUserName",
                              width: 200,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Gerrit HTTP Password",
                              dataIndex: "gerritHttpPassword",
                              width: 220,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Jira SEC PAT",
                              dataIndex: "jiraSecPat",
                              width: 200,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Jira MX PAT",
                              dataIndex: "jiraMxPat",
                              width: 200,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Jira LA PAT",
                              dataIndex: "jiraLaPat",
                              width: 200,
                              render: (value: string) => value || "-",
                            },
                          ]}
                        />
                      ) : (
                        <Table
                          rowKey="id"
                          size="small"
                          pagination={{
                            current: projectPagination.current,
                            pageSize: projectPagination.pageSize,
                            total: displayedProjects.length,
                            showSizeChanger: true,
                            pageSizeOptions: [...TABLE_PAGE_SIZE_OPTIONS],
                          }}
                          sticky={{
                            offsetHeader: 0,
                            getContainer: () => mainScrollRef.current ?? document.body,
                          }}
                          dataSource={displayedProjects}
                          onChange={(pagination) => {
                            setProjectPagination({
                              current: pagination.current ?? 1,
                              pageSize: pagination.pageSize ?? TABLE_PAGE_SIZE_DEFAULT,
                            });
                          }}
                          onRow={(record) => ({
                            onClick: () => handleLeftbarSelect(record.id),
                            className: "cursor-pointer",
                          })}
                          scroll={{ x: 1200 }}
                          columns={[
                            {
                              title: "Project Name",
                              dataIndex: "projectName",
                              width: 220,
                            },
                            {
                              title: "Branch",
                              dataIndex: "branch",
                              width: 180,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Notes",
                              dataIndex: "notes",
                              width: 220,
                              render: (value: string) => value || "-",
                            },
                            {
                              title: "Task Managements",
                              dataIndex: "taskManagements",
                              width: 220,
                              render: (value: string[]) => (value.length ? value.join(", ") : "-"),
                            },
                            {
                              title: "Repositories",
                              dataIndex: "repositories",
                              width: 220,
                              render: (value: string[]) => (value.length ? value.join(", ") : "-"),
                            },
                            {
                              title: "PICs",
                              dataIndex: "pics",
                              width: 180,
                              render: (value: string[]) => (value.length ? value.join(", ") : "-"),
                            },
                            {
                              title: "Dev White List",
                              dataIndex: "devWhiteList",
                              width: 220,
                              render: (value: string[]) => (value.length ? value.join(", ") : "-"),
                            },
                          ]}
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
