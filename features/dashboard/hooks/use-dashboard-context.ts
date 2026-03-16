import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type AccessMode, getCurrentUser, getDepartments, getProjects } from "@/lib/management-api";
import { resolveAvailableViewModes } from "../model/view-modes";

type UseDashboardContextOptions = {
  initialFullName: string;
  initialAccessMode: AccessMode;
};

export function useDashboardContext({ initialFullName, initialAccessMode }: UseDashboardContextOptions) {
  const currentUserQuery = useQuery({
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

  const currentUser = currentUserQuery.data;
  const fullName = currentUser?.fullname ?? initialFullName;
  const accessMode = currentUser?.accessMode ?? initialAccessMode;

  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const managedDepartmentIds = useMemo(
    () => currentUser?.departmentPicPartIds ?? [],
    [currentUser?.departmentPicPartIds],
  );

  const availableViewModes = useMemo(
    () => resolveAvailableViewModes(accessMode, currentUser?.departmentPicPartIds),
    [accessMode, currentUser?.departmentPicPartIds],
  );

  return {
    currentUser,
    fullName,
    accessMode,
    availableViewModes,
    departments,
    projects,
    managedDepartmentIds,
    isProfileLoading: currentUserQuery.isLoading,
    currentUserError: currentUserQuery.error,
    departmentsError: departmentsQuery.error,
    projectsError: projectsQuery.error,
  };
}
