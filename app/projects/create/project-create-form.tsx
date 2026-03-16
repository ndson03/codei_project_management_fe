"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, Select, Space, Typography, message } from "antd";
import { createProject, getCurrentUser, getDepartments, getUsers, HttpError } from "@/lib/management-api";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const deptIdFromQuery = searchParams.get("deptId");
  const requestedDeptId = deptIdFromQuery ? Number(deptIdFromQuery) : undefined;

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const resolvedDeptId = useMemo(() => {
    if (Number.isFinite(requestedDeptId)) {
      return requestedDeptId;
    }

    const managedDepartmentId = currentUserQuery.data?.departmentPicPartIds?.[0];
    if (Number.isFinite(managedDepartmentId)) {
      return managedDepartmentId;
    }

    return departmentsQuery.data?.[0]?.partId;
  }, [requestedDeptId, currentUserQuery.data?.departmentPicPartIds, departmentsQuery.data]);

  const selectedDepartment = useMemo(
    () => (departmentsQuery.data ?? []).find((department) => department.partId === resolvedDeptId),
    [departmentsQuery.data, resolvedDeptId],
  );

  const usersQuery = useQuery({
    queryKey: ["users", "by-dept", resolvedDeptId],
    queryFn: () => getUsers({ assignmentType: "PIC", deptId: resolvedDeptId }),
    enabled: Number.isFinite(resolvedDeptId),
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (createdProject) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      message.success("Create project success");
      router.replace(`/projects/${createdProject.id}`);
      router.refresh();
    },
  });

  return (
    <Card className="shadow-sm" title="Create Project">
      <Form
        layout="vertical"
        initialValues={{ deptId: resolvedDeptId }}
        key={resolvedDeptId ?? "no-dept"}
        onFinish={(values) => {
          if (!values.deptId) {
            message.error("No managed department found for this account.");
            return;
          }

          createProjectMutation.mutate({
            deptId: values.deptId,
            projectName: values.projectName,
            branch: values.branch,
            notes: values.notes,
            taskManagements: parseCsv(values.taskManagements || ""),
            repositories: parseCsv(values.repositories || ""),
            pics: values.pics || [],
            devWhiteList: values.devWhiteList || [],
          });
        }}
      >
        <Form.Item name="deptId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item label="Department">
          <Input
            readOnly
            value={
              selectedDepartment
                ? selectedDepartment.partName
                : departmentsQuery.isLoading
                  ? "Loading..."
                  : "No department assigned"
            }
          />
        </Form.Item>
        <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="pics" label="PM Users">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            loading={usersQuery.isLoading}
            options={(usersQuery.data ?? []).map((user) => ({
              value: user.username,
              label: `${user.fullname} (${user.username})`,
            }))}
            placeholder="Search and select PM users"
          />
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
        <Form.Item name="devWhiteList" label="Dev White List (Usernames)">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            loading={usersQuery.isLoading}
            options={(usersQuery.data ?? []).map((user) => ({
              value: user.username,
              label: `${user.fullname} (${user.username})`,
            }))}
            placeholder="Search and select usernames"
          />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={createProjectMutation.isPending}
            disabled={!resolvedDeptId}
          >
            Submit
          </Button>
          <Link href="/projects">
            <Button>Back</Button>
          </Link>
        </Space>
      </Form>

      {!resolvedDeptId ? (
        <Alert
          className="!mt-3"
          type="warning"
          showIcon
          message="No managed department found for this account."
        />
      ) : null}

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
