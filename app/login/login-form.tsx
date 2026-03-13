"use client";

import { useState } from "react";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginFormValues = {
  username: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: LoginFormValues) {
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.ok) {
      router.push("/");
      router.refresh();
      return;
    }

    if (result?.error === "CredentialsSignin") {
      setError("Invalid username or password (401).");
      return;
    }

    if (result?.error === "FORBIDDEN") {
      setError("You are authenticated but do not have permission (403).");
      return;
    }

    setError("Sign in failed due to a server or permission error.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <Typography.Title level={3} className="!mb-1">
          Sign in
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Use your account to access the project management system.
        </Typography.Paragraph>

        {error ? <Alert className="!mb-4" message={error} type="error" showIcon /> : null}

        <Form<LoginFormValues> layout="vertical" onFinish={onSubmit} autoComplete="on">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Sign in
          </Button>
        </Form>
      </Card>
    </main>
  );
}