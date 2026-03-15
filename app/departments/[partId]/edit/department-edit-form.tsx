"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Form, Input, Select, Space, Typography, message } from "antd";
import { getDepartments, getUsers, HttpError, updateDepartment } from "@/lib/management-api";

type DepartmentEditFormProps = {
  partId: number;
};

function renderMutationError(mutationError: unknown) {
  if (!(mutationError instanceof HttpError)) {
    return "Unexpected error";
  }

  return `${mutationError.status}: ${mutationError.message}`;
}

export function DepartmentEditForm({ partId }: DepartmentEditFormProps) {
  const [form] = Form.useForm();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const department = useMemo(
    () => (departmentsQuery.data ?? []).find((item) => item.partId === partId),
    [departmentsQuery.data, partId],
  );

  const updateMutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      message.success("Department updated");
    },
  });

  if (departmentsQuery.isLoading) {
    return <Card className="shadow-sm">Loading department...</Card>;
  }

  if (!department) {
    return (
      <Card className="shadow-sm">
        <Empty description="Department not found" />
      </Card>
    );
  }

  return (
    <Card className="shadow-sm" title={`Edit Department ${department.partId}`}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          partName: department.partName,
          gitPat: "",
          ecodePat: department.ecodePat,
          gerritUserName: department.gerritUserName,
          gerritHttpPassword: department.gerritHttpPassword,
          jiraSecPat: department.jiraSecPat,
          jiraMxPat: department.jiraMxPat,
          jiraLaPat: department.jiraLaPat,
          departmentPicUserId: department.departmentPicUserId ?? undefined,
        }}
        onFinish={(values) => {
          updateMutation.mutate({
            deptId: partId,
            partName: values.partName,
            gitPat: values.gitPat,
            ecodePat: values.ecodePat,
            gerritUserName: values.gerritUserName,
            gerritHttpPassword: values.gerritHttpPassword,
            jiraSecPat: values.jiraSecPat,
            jiraMxPat: values.jiraMxPat,
            jiraLaPat: values.jiraLaPat,
            departmentPicUserId: values.departmentPicUserId,
          });
        }}
      >
        <Form.Item name="partName" label="Part Name" rules={[{ required: true }]}>
          <Input />
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
        <Form.Item name="departmentPicUserId" label="Department PIC User">
          <Select
            allowClear
            loading={usersQuery.isLoading}
            options={(usersQuery.data ?? []).map((user) => ({
              value: user.id,
              label: `${user.fullname} (${user.username})`,
            }))}
            placeholder="Select PIC user"
          />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
            Save
          </Button>
          <Link href={`/departments/${partId}`}>
            <Button>Back</Button>
          </Link>
        </Space>
      </Form>

      {updateMutation.error ? (
        <Alert className="!mt-3" type="error" showIcon message={renderMutationError(updateMutation.error)} />
      ) : null}

      {updateMutation.data ? (
        <Typography.Text type="success" className="!mt-3 block">
          Department updated successfully.
        </Typography.Text>
      ) : null}
    </Card>
  );
}
