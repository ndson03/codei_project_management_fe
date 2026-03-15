import { proxyBackendRequest } from "@/lib/api-route-proxy";

export async function GET() {
  return proxyBackendRequest("/api/projects", "GET");
}
