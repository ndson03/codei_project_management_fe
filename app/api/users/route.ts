import { proxyBackendRequest } from "@/lib/api-route-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const backendPath = query ? `/api/users?${query}` : "/api/users";

  return proxyBackendRequest(backendPath, "GET");
}
