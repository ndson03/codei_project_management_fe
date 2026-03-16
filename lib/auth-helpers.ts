import type { AccessMode } from "@/models/types";

export function resolveAccessMode(role: string | undefined): AccessMode {
  if (role === "ROLE_ADMIN") return "ADMIN";
  if (role === "ROLE_PIC") return "PIC";
  return "USER";
}
