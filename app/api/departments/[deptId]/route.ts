import { proxyBackendRequest } from "@/lib/api-route-proxy";

type RouteParams = {
  params: Promise<{
    deptId: string;
  }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  const { deptId } = await params;
  return proxyBackendRequest(`/api/departments/${deptId}`, "PUT", request);
}
