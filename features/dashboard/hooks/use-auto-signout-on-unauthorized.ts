import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { HttpError } from "@/lib/management-api";

export function useAutoSignOutOnUnauthorized(errors: unknown[]) {
  useEffect(() => {
    const shouldSignOut = errors
      .filter((entry): entry is HttpError => entry instanceof HttpError)
      .some((entry) => entry.status === 401);

    if (shouldSignOut) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [errors]);
}
