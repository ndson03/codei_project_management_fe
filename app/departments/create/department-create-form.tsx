"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, Select, Space, Typography, message } from "antd";
import { createDepartment, getUsers, HttpError } from "@/lib/management-api";

function renderMutationError(mutationError: unknown) {
  if (!(mutationError instanceof HttpError)) {
    return "Unexpected error";
  }

  return `${mutationError.status}: ${mutationError.message}`;
}

export function DepartmentCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", "assignment", "PIC"],
    queryFn: () => getUsers({ assignmentType: "PIC" }),
  });

  const createDepartmentMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: async (createdDepartment) => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      message.success("Create department success");
      router.replace(`/departments/${createdDepartment.partId}`);
      router.refresh();
    },
  });

  return (
    <Card className="shadow-sm" title="Create Department">
      <Form
        layout="vertical"
        onFinish={(values) => {
          createDepartmentMutation.mutate({
            partName: values.partName,
            gitPat: values.gitPat,
            ecodePat: values.ecodePat,
            gerritUserName: values.gerritUserName,
            gerritHttpPassword: values.gerritHttpPassword,
            jiraSecPat: values.jiraSecPat,
            jiraMxPat: values.jiraMxPat,
            jiraLaPat: values.jiraLaPat,
            departmentPicUsernames: values.departmentPicUsernames || [],
          });
        }}
      >
        <Form.Item name="partName" label="Part Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="departmentPicUsernames" label="Department PIC Users">
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
            placeholder="Search and select PIC users"
          />
        </Form.Item>
        <Form.Item name="gitPat" label="Git PAT" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ecodePat" label="Ecode PAT" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gerritUserName" label="Gerrit Username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gerritHttpPassword" label="Gerrit HTTP Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="jiraSecPat" label="Jira SEC PAT" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="jiraMxPat" label="Jira MX PAT" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="jiraLaPat" label="Jira LA PAT" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={createDepartmentMutation.isPending}>
            Submit
          </Button>
          <Link href="/departments">
            <Button>Back</Button>
          </Link>
        </Space>
      </Form>

      {createDepartmentMutation.error ? (
        <Alert
          className="!mt-3"
          type="error"
          showIcon
          message={renderMutationError(createDepartmentMutation.error)}
        />
      ) : null}

      {createDepartmentMutation.data ? (
        <Typography.Text type="success" className="!mt-3 block">
          Department created successfully.
        </Typography.Text>
      ) : null}
    </Card>
  );
}
