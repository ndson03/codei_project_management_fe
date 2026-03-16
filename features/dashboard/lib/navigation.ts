import { type AccessMode, type DepartmentResponse } from "@/lib/management-api";

type BuildProjectCreateRouteOptions = {
  accessMode: AccessMode;
  selectedDepartmentId?: number;
  managedDepartmentIds: number[];
  departments: DepartmentResponse[];
};

export function buildProjectCreateRoute({
  accessMode,
  selectedDepartmentId,
  managedDepartmentIds,
  departments,
}: BuildProjectCreateRouteOptions): string {
  const defaultDepartmentId =
    selectedDepartmentId ??
    (accessMode === "PIC" ? managedDepartmentIds[0] : undefined) ??
    departments[0]?.partId;

  const deptQuery = defaultDepartmentId ? `?deptId=${defaultDepartmentId}` : "";
  return `/projects/create${deptQuery}`;
}
