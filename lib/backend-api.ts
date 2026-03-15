import { getServerAuthSession } from "@/auth";

export class ApiAuthError extends Error {
  constructor(message: string, public status: 401 | 403) {
    super(message);
    this.name = "ApiAuthError";
  }
}

export async function fetchBackend(path: string, init: RequestInit = {}) {
  const backendUrl = process.env.BACKEND_BASE_URL;
  if (!backendUrl) {
    throw new Error("Missing BACKEND_BASE_URL environment variable.");
  }
  const normalizedBaseUrl = backendUrl.replace(/\/+$/, "");

  const session = await getServerAuthSession();
  if (!session?.accessToken) {
    throw new ApiAuthError("Missing access token.", 401);
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${normalizedBaseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new ApiAuthError("Unauthorized token.", 401);
  }

  if (response.status === 403) {
    throw new ApiAuthError("Forbidden by role.", 403);
  }

  return response;
}