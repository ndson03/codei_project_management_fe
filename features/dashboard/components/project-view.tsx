"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Empty, Typography, message } from "antd";
import { deleteProject, HttpError, type ProjectResponse } from "@/lib/management-api";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { canCreateProject, canManageProjectByDepartment } from "@/features/dashboard/lib/permissions";
import { buildProjectCreateRoute } from "@/features/dashboard/lib/navigation";
import { getDisplayedProjects, getManagedProjects } from "@/features/dashboard/lib/leftbar-items";
import { TABLE_PAGE_SIZE_DEFAULT } from "@/lib/table-pagination";
import { ProjectDetailCard } from "./project-detail-card";
import { ProjectTable } from "./project-table";

type ProjectViewProps = {
  selectedProjectId?: number;
};

function getHttpErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) return "Unexpected error";
  return `${error.status}: ${error.message}`;
}

export function ProjectView({ selectedProjectId }: ProjectViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });

  const { accessMode, departments, projects, managedDepartmentIds, projectScope } = useDashboard();

  const myProjects = getManagedProjects(projects, managedDepartmentIds);
  const displayedProjects = getDisplayedProjects(projects, myProjects, projectScope);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectDepartmentName = selectedProject
    ? (departments.find((d) => d.partId === selectedProject.departmentId)?.partName ?? "-")
    : "-";

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async (_, deletedProjectId) => {
      queryClient.setQueryData<ProjectResponse[]>(["projects"], (prev) =>
        (prev ?? []).filter((p) => p.id !== deletedProjectId),
      );
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      message.success("Project deleted");
      router.push("/projects");
      router.refresh();
    },
    onError: (error) => {
      message.error(`Delete project failed: ${getHttpErrorMessage(error)}`);
    },
  });

  if (selectedProject) {
    return (
      <ProjectDetailCard
        project={selectedProject}
        projectDepartmentName={projectDepartmentName}
        canEdit={canManageProjectByDepartment(accessMode, managedDepartmentIds, selectedProject.departmentId)}
        canDelete={canManageProjectByDepartment(accessMode, managedDepartmentIds, selectedProject.departmentId)}
        deletePending={deleteProjectMutation.isPending}
        onEdit={() => router.push(`/projects/${selectedProject.id}/edit`)}
        onDelete={() => deleteProjectMutation.mutate(selectedProject.id)}
      />
    );
  }

  return (
    <Card className="shadow-sm">
      <Typography.Title level={4} className="!mb-3">
        Project List
      </Typography.Title>
      {displayedProjects.length === 0 ? (
        <Empty description="No projects available.">
          {canCreateProject(accessMode) ? (
            <Button
              type="primary"
              onClick={() =>
                router.push(
                  buildProjectCreateRoute({
                    accessMode,
                    selectedDepartmentId: undefined,
                    managedDepartmentIds,
                    departments,
                  }),
                )
              }
            >
              Create Project
            </Button>
          ) : null}
        </Empty>
      ) : (
        <ProjectTable
          projects={displayedProjects}
          pagination={pagination}
          onPaginationChange={setPagination}
          onRowSelect={(id) => router.push(`/projects/${id}`, { scroll: false })}
          getStickyContainer={() => document.getElementById("app-main-scroll") ?? document.body}
        />
      )}
    </Card>
  );
}
