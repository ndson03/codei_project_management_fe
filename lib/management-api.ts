export type AccessMode = "ADMIN" | "PIC" | "PM" | "NONE";

export type CurrentUser = {
  id: number;
  username: string;
  fullname: string;
  email: string;
  accessMode: AccessMode;
  departmentPicPartIds: number[];
  pmProjectIds: number[];
};

export type UserResponse = {
  id: number;
  username: string;
  fullname: string;
  email: string;
};

export type CreateDepartmentRequest = {
  partName: string;
  gitPat: string;
  ecodePat: string;
  gerritUserName: string;
  gerritHttpPassword: string;
  jiraSecPat: string;
  jiraMxPat: string;
  jiraLaPat: string;
  departmentPicUserId?: number;
};

export type DepartmentResponse = {
  partId: number;
  partName: string;
  gitPat: string;
  ecodePat: string;
  gerritUserName: string;
  gerritHttpPassword: string;
  jiraSecPat: string;
  jiraMxPat: string;
  jiraLaPat: string;
  departmentPicUserId: number | null;
  departmentPicUsername: string | null;
};

export type CreateProjectRequest = {
  deptId: number;
  projectName: string;
  branch: string;
  notes: string;
  taskManagements: string[];
  repositories: string[];
  pics: string[];
  devWhiteList: string[];
  pmUserIds: number[];
};

export type UpdateDepartmentRequest = {
  deptId: number;
  partName: string;
  gitPat: string;
  ecodePat: string;
  gerritUserName: string;
  gerritHttpPassword: string;
  jiraSecPat: string;
  jiraMxPat: string;
  jiraLaPat: string;
  departmentPicUserId?: number;
};

export type ProjectResponse = {
  id: number;
  departmentId: number;
  projectName: string;
  branch: string;
  notes: string;
  taskManagements: string[];
  repositories: string[];
  pics: string[];
  devWhiteList: string[];
  pmUserIds: number[];
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

export function getUsers() {
  return requestJson<UserResponse[]>("/api/users", {
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
      pmUserIds: payload.pmUserIds,
    }),
  });
}

export function updateDepartment(payload: UpdateDepartmentRequest) {
  return requestJson<DepartmentResponse>(`/api/admin/departments/${payload.deptId}`, {
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
      departmentPicUserId: payload.departmentPicUserId,
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
  return requestJson<ProjectResponse>(`/api/projects/${payload.projectId}/data`, {
    method: "PUT",
    body: JSON.stringify({
      projectName: payload.projectName,
      branch: payload.branch,
      notes: payload.notes,
      taskManagements: payload.taskManagements,
      repositories: payload.repositories,
      pics: payload.pics,
      devWhiteList: payload.devWhiteList,
      pmUserIds: payload.pmUserIds,
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