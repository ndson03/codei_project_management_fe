import { proxyBackendRequest } from "@/lib/api-route-proxy";

type RouteParams = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  return proxyBackendRequest(`/api/projects/${projectId}/pm`, "PUT", request);
}