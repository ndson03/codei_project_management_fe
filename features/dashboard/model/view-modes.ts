import { type AccessMode } from "@/lib/management-api";

export type DashboardViewMode = "department" | "project" | "statistics";

export function getBaseViewModes(accessMode: AccessMode): readonly DashboardViewMode[] {
  if (accessMode === "ADMIN") {
    return ["department", "project", "statistics"] as const;
  }

  return ["project", "statistics"] as const;
}

export function resolveAvailableViewModes(
  accessMode: AccessMode,
  managedDepartmentIds: number[] | undefined,
): readonly DashboardViewMode[] {
  const baseModes = [...getBaseViewModes(accessMode)];

  if (accessMode === "ADMIN") {
    return ["department", ...baseModes.filter((mode) => mode !== "department")] as const;
  }

  if (managedDepartmentIds && managedDepartmentIds.length > 0) {
    return ["department", ...baseModes.filter((mode) => mode !== "department")] as const;
  }

  return baseModes;
}

export function toViewModeRoute(viewMode: DashboardViewMode): string {
  if (viewMode === "department") {
    return "/departments";
  }

  if (viewMode === "project") {
    return "/projects";
  }

  return "/statistics";
}
