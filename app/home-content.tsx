"use client";

import { Alert, Card, Descriptions, Typography } from "antd";
import { LogoutButton } from "./logout-button";

type HomeContentProps = {
  username: string;
  role: string;
  tokenType: string;
  accessToken: string;
};

export function HomeContent({ username, role, tokenType, accessToken }: HomeContentProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center bg-slate-100 p-6">
      <Card className="shadow-sm">
        <Typography.Title level={3} className="!mb-1">
          Home
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          You are signed in successfully with NextAuth and backend JWT.
        </Typography.Paragraph>

        <Descriptions bordered column={1} className="!mb-4">
          <Descriptions.Item label="Username">{username}</Descriptions.Item>
          <Descriptions.Item label="Role">{role}</Descriptions.Item>
          <Descriptions.Item label="Token type">{tokenType}</Descriptions.Item>
          <Descriptions.Item label="Access token">{accessToken}</Descriptions.Item>
        </Descriptions>

        <Alert
          className="!mb-4"
          type="info"
          showIcon
          message="For protected backend endpoints, send: Authorization: Bearer <accessToken>"
        />

        <LogoutButton />
      </Card>
    </main>
  );
}