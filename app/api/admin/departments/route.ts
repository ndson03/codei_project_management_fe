import { proxyBackendRequest } from "@/lib/api-route-proxy";

export async function POST(request: Request) {
  return proxyBackendRequest("/api/admin/departments", "POST", request);
}