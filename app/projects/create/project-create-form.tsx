"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, InputNumber, Space, Typography, message } from "antd";
import { createProject, HttpError } from "@/lib/management-api";

function parseCsv(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function renderMutationError(mutationError: unknown) {
  if (!(mutationError instanceof HttpError)) {
    return "Unexpected error";
  }

  return `${mutationError.status}: ${mutationError.message}`;
}

export function ProjectCreateForm() {
  const searchParams = useSearchParams();
  const deptIdFromQuery = searchParams.get("deptId");
  const defaultDeptId = deptIdFromQuery ? Number(deptIdFromQuery) : undefined;

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      message.success("Create project success");
    },
  });

  return (
    <Card className="shadow-sm" title="Create Project">
      <Form
        layout="vertical"
        initialValues={{ deptId: Number.isFinite(defaultDeptId) ? defaultDeptId : undefined }}
        onFinish={(values) => {
          createProjectMutation.mutate({
            deptId: values.deptId,
            projectName: values.projectName,
            branch: values.branch,
            notes: values.notes,
            taskManagements: parseCsv(values.taskManagements || ""),
            repositories: parseCsv(values.repositories || ""),
            pics: parseCsv(values.pics || ""),
            devWhiteList: parseCsv(values.devWhiteList || ""),
          });
        }}
      >
        <Form.Item name="deptId" label="Department ID" rules={[{ required: true }]}>
          <InputNumber className="!w-full" />
        </Form.Item>
        <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="branch" label="Branch" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="notes" label="Notes" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="taskManagements" label="Task Managements (comma separated)">
          <Input placeholder="jira" />
        </Form.Item>
        <Form.Item name="repositories" label="Repositories (comma separated)">
          <Input placeholder="repo-a, repo-b" />
        </Form.Item>
        <Form.Item name="pics" label="PICs (comma separated)">
          <Input placeholder="alice" />
        </Form.Item>
        <Form.Item name="devWhiteList" label="Dev White List (comma separated)">
          <Input placeholder="dev01, dev02" />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={createProjectMutation.isPending}>
            Submit
          </Button>
          <Link href="/projects">
            <Button>Back</Button>
          </Link>
        </Space>
      </Form>

      {createProjectMutation.error ? (
        <Alert
          className="!mt-3"
          type="error"
          showIcon
          message={renderMutationError(createProjectMutation.error)}
        />
      ) : null}

      {createProjectMutation.data ? (
        <Typography.Text type="success" className="!mt-3 block">
          Project created successfully.
        </Typography.Text>
      ) : null}
    </Card>
  );
}
