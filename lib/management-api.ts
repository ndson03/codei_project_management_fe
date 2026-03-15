export type CurrentUser = {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
};

export type UserResponse = CurrentUser;

export type CreateDepartmentRequest = {
  partId: number;
  partName: string;
  gitPat: string;
  ecodePat: string;
  gerritUserName: string;
  gerritHttpPassword: string;
  jiraSecPat: string;
  jiraMxPat: string;
  jiraLaPat: string;
};

export type DepartmentResponse = {
  partId: number;
  partName: string;
  departmentPicUserId: number | null;
};

export type AssignDeptPicRequest = {
  deptId: number;
  userId: number;
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

export type AssignProjectPmRequest = {
  projectId: number;
  userId: number;
};

export type UpdateProjectRequest = {
  projectId: number;
  branch: string;
  repositories: string[];
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

export function assignDepartmentPic(payload: AssignDeptPicRequest) {
  return requestJson<DepartmentResponse>(`/api/admin/departments/${payload.deptId}/pic`, {
    method: "PUT",
    body: JSON.stringify({ userId: payload.userId }),
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

export function assignProjectPm(payload: AssignProjectPmRequest) {
  return requestJson<ProjectResponse>(`/api/projects/${payload.projectId}/pm`, {
    method: "PUT",
    body: JSON.stringify({ userId: payload.userId }),
  });
}

export function updateProject(payload: UpdateProjectRequest) {
  return requestJson<ProjectResponse>(`/api/projects/${payload.projectId}`, {
    method: "PUT",
    body: JSON.stringify({
      branch: payload.branch,
      repositories: payload.repositories,
    }),
  });
}