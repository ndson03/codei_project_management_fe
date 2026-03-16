import { useCallback, useEffect, useMemo, useState } from "react";
import { type AccessMode } from "@/lib/management-api";

export type ProjectScope = "my" | "all";

const STORAGE_KEY = "project-scope";

export function useProjectScope(accessMode: AccessMode) {
  const [projectScope, setProjectScope] = useState<ProjectScope>("all");

  useEffect(() => {
    if (accessMode === "PIC") {
      const savedScope = window.sessionStorage.getItem(STORAGE_KEY);
      if (savedScope === "my" || savedScope === "all") {
        setProjectScope(savedScope);
        return;
      }
    }

    setProjectScope("all");
  }, [accessMode]);

  const onHeaderTabChange = useCallback((key: string) => {
    const nextScope: ProjectScope = key === "my" ? "my" : "all";
    setProjectScope(nextScope);
    window.sessionStorage.setItem(STORAGE_KEY, nextScope);
  }, []);

  const headerTabs = useMemo(() => {
    if (accessMode !== "PIC") {
      return undefined;
    }

    return [
      { key: "my", label: "My Project" },
      { key: "all", label: "All Project" },
    ];
  }, [accessMode]);

  return {
    projectScope,
    headerTabs,
    activeHeaderTabKey: accessMode === "PIC" ? projectScope : undefined,
    onHeaderTabChange: accessMode === "PIC" ? onHeaderTabChange : undefined,
  };
}
