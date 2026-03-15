"use client";

import { Button } from "antd";
import { signOut } from "next-auth/react";
import { logoutFromBackend } from "@/lib/management-api";

export function LogoutButton() {
  return (
    <Button
      htmlType="button"
      onClick={async () => {
        try {
          await logoutFromBackend();
        } finally {
          await signOut({ callbackUrl: "/login" });
        }
      }}
      danger
    >
      Sign out
    </Button>
  );
}