import type {
  CurrentUser,
  UserResponse,
  DepartmentResponse,
  ProjectResponse,
  StatisticResult,
  CreateDepartmentRequest,
  CreateProjectRequest,
  UpdateDepartmentRequest,
} from "@/models/types";

export type {
  AccessMode,
  CurrentUser,
  UserResponse,
  CreateDepartmentRequest,
  DepartmentResponse,
  CreateProjectRequest,
  UpdateDepartmentRequest,
  ProjectResponse,
  StatisticResult,
} from "@/models/types";

type GetUsersParams = {
  assignmentType?: "PIC";
  deptId?: number;
};

export class HttpError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = "HttpError";
  }
}

function getErrorMessage(details: unknown) {
  if (!details || typeof details !== "object") {
    return "Request failed";
  }

  const maybeMessage = (details as { message?: unknown }).message;
  return typeof maybeMessage === "string" && maybeMessage.trim()
    ? maybeMessage
    : "Request failed";
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const raw = await response.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  if (!response.ok) {
    throw new HttpError(getErrorMessage(parsed), response.status, parsed);
  }

  return parsed as T;
}

export function getCurrentUser() {
  return requestJson<CurrentUser>("/api/users/me", {
    method: "GET",
    cache: "no-store",
  });
}

export function getUsers(params?: GetUsersParams) {
  const query = new URLSearchParams();
  if (params?.assignmentType) {
    query.set("assignmentType", params.assignmentType);
  }
  if (params?.deptId != null) {
    query.set("deptId", String(params.deptId));
  }

  const url = query.size ? `/api/users?${query.toString()}` : "/api/users";

  return requestJson<UserResponse[]>(url, {
    method: "GET",
    cache: "no-store",
  });
}

export function getDepartments() {
  return requestJson<DepartmentResponse[]>("/api/departments", {
    method: "GET",
    cache: "no-store",
  });
}

export function getProjects() {
  return requestJson<ProjectResponse[]>("/api/projects", {
    method: "GET",
    cache: "no-store",
  });
}

export function getStatisticResults() {
  return requestJson<StatisticResult[]>("/api/statistics", {
    method: "GET",
    cache: "no-store",
  });
}

export function createDepartment(payload: CreateDepartmentRequest) {
  return requestJson<DepartmentResponse>("/api/admin/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createProject(payload: CreateProjectRequest) {
  return requestJson<ProjectResponse>(`/api/departments/${payload.deptId}/projects`, {
    method: "POST",
    body: JSON.stringify({
      projectName: payload.projectName,
      branch: payload.branch,
      notes: payload.notes,
      taskManagements: payload.taskManagements,
      repositories: payload.repositories,
      pics: payload.pics,
      devWhiteList: payload.devWhiteList,
    }),
  });
}

export function updateDepartment(payload: UpdateDepartmentRequest) {
  return requestJson<DepartmentResponse>(`/api/departments/${payload.deptId}`, {
    method: "PUT",
    body: JSON.stringify({
      partName: payload.partName,
      gitPat: payload.gitPat,
      ecodePat: payload.ecodePat,
      gerritUserName: payload.gerritUserName,
      gerritHttpPassword: payload.gerritHttpPassword,
      jiraSecPat: payload.jiraSecPat,
      jiraMxPat: payload.jiraMxPat,
      jiraLaPat: payload.jiraLaPat,
      departmentPicUsernames: payload.departmentPicUsernames,
    }),
  });
}

export async function deleteDepartment(deptId: number) {
  const response = await fetch(`/api/admin/departments/${deptId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const raw = await response.text();
    let parsed: unknown = raw;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = raw;
    }
    throw new HttpError(getErrorMessage(parsed), response.status, parsed);
  }
}

export function updateProjectData(payload: CreateProjectRequest & { projectId: number }) {
  return requestJson<ProjectResponse>(`/api/projects/${payload.projectId}`, {
    method: "PUT",
    body: JSON.stringify({
      projectName: payload.projectName,
      branch: payload.branch,
      notes: payload.notes,
      taskManagements: payload.taskManagements,
      repositories: payload.repositories,
      pics: payload.pics,
      devWhiteList: payload.devWhiteList,
    }),
  });
}

export async function deleteProject(projectId: number) {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const raw = await response.text();
    let parsed: unknown = raw;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = raw;
    }
    throw new HttpError(getErrorMessage(parsed), response.status, parsed);
  }
}

export function logoutFromBackend() {
  return requestJson<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}