"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Space, Tabs, Typography, type MenuProps } from "antd";
import { type AccessMode, logoutFromBackend } from "@/lib/management-api";

type HomeHeaderProps = {
  fullName: string;
  accessMode: AccessMode;
  viewMode: "department" | "project";
  availableViewModes: Array<"department" | "project">;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function HomeHeader({
  fullName,
  accessMode,
  viewMode,
  availableViewModes,
  sidebarCollapsed,
  onToggleSidebar,
}: HomeHeaderProps) {
  const router = useRouter();

  const tabItems = availableViewModes.map((mode) => ({
    key: mode,
    label: <span className="text-base font-semibold">{mode === "department" ? "Department" : "Project"}</span>,
  }));

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "signout",
      label: "Sign out",
      danger: true,
      onClick: async () => {
        try {
          await logoutFromBackend();
        } finally {
          await signOut({ callbackUrl: "/login" });
        }
      },
    },
  ];

  return (
    <Layout.Header className="!h-auto !bg-white !px-5 !py-2 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <Button
            type="text"
            aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleSidebar}
          />

          <Typography.Title level={5} className="!mb-0 !text-base">
            Codei Project Management
          </Typography.Title>

          {tabItems.length > 0 ? (
            <Tabs
              size="small"
              className="!mb-0"
              tabBarStyle={{ margin: 0 }}
              activeKey={viewMode}
              onChange={(key) => {
                router.push(key === "department" ? "/departments" : "/projects");
              }}
              items={tabItems}
            />
          ) : null}
        </div>

        <Space size="middle" align="center" wrap>
          <Typography.Text strong>{fullName}</Typography.Text>
          <Typography.Text type="secondary">{accessMode}</Typography.Text>

          <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]}>
            <Avatar className="cursor-pointer">{fullName.slice(0, 1).toUpperCase()}</Avatar>
          </Dropdown>
        </Space>
      </div>
    </Layout.Header>
  );
}