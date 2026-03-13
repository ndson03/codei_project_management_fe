"use client";

import { Button } from "antd";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <Button
      htmlType="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      danger
    >
      Sign out
    </Button>
  );
}