import { type AccessMode } from "@/lib/management-api";

export function canCreateDepartment(accessMode: AccessMode): boolean {
  return accessMode === "ADMIN";
}

export function canCreateProject(accessMode: AccessMode): boolean {
  return accessMode === "ADMIN" || accessMode === "PIC";
}

export function canUpdateDepartment(accessMode: AccessMode): boolean {
  return accessMode === "ADMIN" || accessMode === "PIC";
}

export function canDeleteDepartment(accessMode: AccessMode): boolean {
  return accessMode === "ADMIN";
}

export function canManageProjectByDepartment(
  accessMode: AccessMode,
  managedDepartmentIds: number[],
  departmentId: number,
): boolean {
  if (accessMode === "ADMIN") {
    return true;
  }

  if (accessMode === "PIC") {
    return managedDepartmentIds.includes(departmentId);
  }

  return false;
}
