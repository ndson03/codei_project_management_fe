"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Descriptions, Empty, Layout, Space, Table, Typography, message } from "antd";
import { signOut } from "next-auth/react";
import { getCurrentUser, getDepartments, getProjects, type ProjectResponse, HttpError } from "@/lib/management-api";
import { CommonLeftbar } from "./common-leftbar";
import { HomeHeader } from "./home-header";

type ViewMode = "department" | "project";

type HomeContentProps = {
  initialFullName: string;
  initialRole: string;
  viewMode: ViewMode;
  selectedDepartmentId?: number;
  selectedProjectId?: number;
};

function normalizeRole(rawRole: string | undefined) {
  if (!rawRole) {
    return "";
  }

  const upper = rawRole.trim().toUpperCase();
  return upper.startsWith("ROLE_") ? upper.slice(5) : upper;
}

export function HomeContent({
  initialFullName,
  initialRole,
  viewMode,
  selectedDepartmentId: initialSelectedDepartmentId,
  selectedProjectId: initialSelectedProjectId,
}: HomeContentProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(initialSelectedDepartmentId);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(initialSelectedProjectId);

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

  function canCreateDepartment() {
    return role === "ADMIN";
  }

  function canCreateProject() {
    return role === "DEPT_PIC";
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

    const deptQuery = selectedDepartmentId ? `?deptId=${selectedDepartmentId}` : "";
    router.push(`/projects/create${deptQuery}`);
  }

  function handleLeftbarSelect(id: number) {
    if (viewMode === "project") {
      const project = projects.find((item) => item.id === id);
      if (!project) {
        return;
      }

      router.push(`/projects/${project.id}`);
      return;
    }

    router.push(`/departments/${id}`);
  }

  function renderProjectDetail(project: ProjectResponse) {
    return (
      <Card className="shadow-sm">
        <Typography.Title level={4} className="!mb-4">
          Project Detail
        </Typography.Title>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Project ID">{project.id}</Descriptions.Item>
          <Descriptions.Item label="Department ID">{project.departmentId}</Descriptions.Item>
          <Descriptions.Item label="Project Name">{project.projectName}</Descriptions.Item>
          <Descriptions.Item label="Branch">{project.branch || "-"}</Descriptions.Item>
          <Descriptions.Item label="Notes">{project.notes || "-"}</Descriptions.Item>
            <Descriptions.Item label="Task Managements">
              {project.taskManagements.length ? project.taskManagements.join(", ") : "-"}
            </Descriptions.Item>
          <Descriptions.Item label="Repositories">
            {project.repositories.length ? project.repositories.join(", ") : "-"}
          </Descriptions.Item>
            <Descriptions.Item label="PICs">
              {project.pics.length ? project.pics.join(", ") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Dev White List">
              {project.devWhiteList.length ? project.devWhiteList.join(", ") : "-"}
            </Descriptions.Item>
          <Descriptions.Item label="PM User IDs">
            {project.pmUserIds.length ? project.pmUserIds.join(", ") : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

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

  const activeLeftbarId = viewMode === "project" ? selectedProjectId : selectedDepartmentId;

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
                activeKey={activeLeftbarId}
                onSelect={handleLeftbarSelect}
                emptyText={viewMode === "project" ? "No projects found" : "No departments found"}
                onCreate={goToCreateRoute}
                disableCreate={viewMode === "project" ? !canCreateProject() : !canCreateDepartment()}
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

              {viewMode === "project" && selectedProject ? renderProjectDetail(selectedProject) : null}

              {viewMode === "department" && selectedDepartment ? (
                <Card className="shadow-sm">
                  <Typography.Title level={4} className="!mb-4">
                    Department Detail
                  </Typography.Title>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Part ID">{selectedDepartment.partId}</Descriptions.Item>
                    <Descriptions.Item label="Part Name">{selectedDepartment.partName}</Descriptions.Item>
                    <Descriptions.Item label="Department PIC User ID">
                      {selectedDepartment.departmentPicUserId ?? "Unassigned"}
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-6">
                    <Button
                      type="primary"
                      disabled={!canCreateDepartment() && !canCreateProject()}
                      onClick={goToCreateRoute}
                    >
                      {viewMode === "department" ? "Create Department / Project" : "Create Project"}
                    </Button>
                  </div>
                </Card>
              ) : null}

              {((viewMode === "project" && !selectedProject) ||
                (viewMode === "department" && !selectedDepartment)) ? (
                <Card className="shadow-sm">
                  <Typography.Title level={4} className="!mb-3">
                    {viewMode === "department" ? "Department List" : "Project List"}
                  </Typography.Title>

                  {(viewMode === "department" ? departments.length : projects.length) === 0 ? (
                    <Empty
                      description={
                        viewMode === "project"
                          ? "No projects available."
                          : "No departments available."
                      }
                    >
                      <Button
                        type="primary"
                        disabled={viewMode === "department" ? !canCreateDepartment() : !canCreateProject()}
                        onClick={goToCreateRoute}
                      >
                        {viewMode === "department" ? "Create Department" : "Create Project"}
                      </Button>
                    </Empty>
                  ) : (
                    <>
                      {viewMode === "department" ? (
                        <Table
                          rowKey="partId"
                          size="small"
                          pagination={false}
                          dataSource={departments}
                          onRow={(record) => ({
                            onClick: () => handleLeftbarSelect(record.partId),
                            className: "cursor-pointer",
                          })}
                          columns={[
                            {
                              title: "Part ID",
                              dataIndex: "partId",
                              width: 120,
                            },
                            {
                              title: "Part Name",
                              dataIndex: "partName",
                            },
                            {
                              title: "Department PIC User ID",
                              dataIndex: "departmentPicUserId",
                              render: (value: number | null) => value ?? "Unassigned",
                            },
                          ]}
                        />
                      ) : (
                        <Table
                          rowKey="id"
                          size="small"
                          pagination={false}
                          dataSource={projects}
                          onRow={(record) => ({
                            onClick: () => handleLeftbarSelect(record.id),
                            className: "cursor-pointer",
                          })}
                          scroll={{ x: 1200 }}
                          columns={[
                            {
                              title: "Project ID",
                              dataIndex: "id",
                              width: 120,
                            },
                            {
                              title: "Department ID",
                              dataIndex: "departmentId",
                              width: 140,
                            },
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
                            {
                              title: "PM User IDs",
                              dataIndex: "pmUserIds",
                              width: 180,
                              render: (value: number[]) => (value.length ? value.join(", ") : "-"),
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
