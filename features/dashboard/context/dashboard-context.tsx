import { createContext, useContext } from "react";
import type { useDashboardContext } from "@/features/dashboard/hooks/use-dashboard-context";
import type { useProjectScope } from "@/features/dashboard/hooks/use-project-scope";

export type DashboardContextValue = ReturnType<typeof useDashboardContext> &
  Pick<
    ReturnType<typeof useProjectScope>,
    "projectScope" | "headerTabs" | "activeHeaderTabKey" | "onHeaderTabChange"
  >;

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside AppShell");
  return ctx;
}
