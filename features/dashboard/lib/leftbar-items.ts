import { type DepartmentResponse, type ProjectResponse } from "@/lib/management-api";
import { type ProjectScope } from "../hooks/use-project-scope";

export type LeftbarItem = {
  key: number;
  title: string;
  subtitle?: string;
};

export function getManagedProjects(
  projects: ProjectResponse[],
  managedDepartmentIds: number[],
): ProjectResponse[] {
  return projects.filter((project) => managedDepartmentIds.includes(project.departmentId));
}

export function getDisplayedProjects(
  projects: ProjectResponse[],
  managedProjects: ProjectResponse[],
  projectScope: ProjectScope,
): ProjectResponse[] {
  return projectScope === "my" ? managedProjects : projects;
}

export function buildProjectLeftbarItems(projects: ProjectResponse[]): LeftbarItem[] {
  return projects.map((project) => ({
    key: project.id,
    title: project.projectName,
    subtitle: project.pics.length ? `PICs: ${project.pics.join(", ")}` : "PICs: -",
  }));
}

export function buildDepartmentLeftbarItems(departments: DepartmentResponse[]): LeftbarItem[] {
  return departments.map((department) => ({
    key: department.partId,
    title: department.partName,
    subtitle:
      !department.departmentPicUsernames?.length
        ? "PIC: Unassigned"
        : `PIC Users: ${department.departmentPicUsernames.join(", ")}`,
  }));
}
