export type AccessMode = "ADMIN" | "PIC" | "USER";

export type CurrentUser = {
  username: string;
  fullname: string;
  email: string;
  accessMode: AccessMode;
  departmentPicPartIds: number[];
};

export type UserResponse = {
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
  departmentPicUsernames?: string[];
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
  departmentPicUsernames: string[];
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
  departmentPicUsernames?: string[];
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
};

export type StatisticResult = {
  departmentId: number | null;
  departmentName: string | null;
  project: string | null;
  issueKey: string | null;
  prNumber: number | null;
  createdTime: string | null;
  mergedTime: string | null;
  week: string | null;
  aiSupport: string | null;
  numberOfCommit: number | null;
  numberOfSegments: number | null;
  pattern: string | null;
  numberOfFile: number | null;
  aiLoc: number | null;
  firstAiLoc: number | null;
  developerLoc: number | null;
  aiContribution: number | null;
  service: string | null;
  language: string | null;
  taskType: string | null;
  devType: string | null;
  cycleTimeHour: number | null;
};
