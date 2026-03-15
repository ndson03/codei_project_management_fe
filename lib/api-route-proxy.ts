import { NextResponse } from "next/server";
import { ApiAuthError, fetchBackend } from "@/lib/backend-api";

export async function proxyBackendRequest(path: string, method: "GET" | "POST" | "PUT" | "DELETE", request?: Request) {
  try {
    const bodyText = request ? await request.text() : "";

    const response = await fetchBackend(path, {
      method,
      body: bodyText || undefined,
    });

    const contentType = response.headers.get("content-type") || "application/json";
    const payload = await response.text();

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Internal proxy error." }, { status: 500 });
  }
}