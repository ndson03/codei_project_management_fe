"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Form, Input, Select, Space, Typography, message } from "antd";
import { getCurrentUser, getDepartments, getUsers, HttpError, updateDepartment } from "@/lib/management-api";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const canManagePic = currentUserQuery.data?.accessMode === "ADMIN" || currentUserQuery.data?.accessMode === "PIC";

  const picUsersQuery = useQuery({
    queryKey: ["users", "assignment", "PIC", partId],
    queryFn: () => getUsers({ assignmentType: "PIC", deptId: partId }),
    enabled: canManagePic,
  });

  const department = useMemo(
    () => (departmentsQuery.data ?? []).find((item) => item.partId === partId),
    [departmentsQuery.data, partId],
  );

  const updateMutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      message.success("Department updated");
      router.replace(`/departments/${partId}`);
      router.refresh();
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
    <Card className="shadow-sm" title="Edit Department">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          partName: department.partName,
          gitPat: department.gitPat,
          ecodePat: department.ecodePat,
          gerritUserName: department.gerritUserName,
          gerritHttpPassword: department.gerritHttpPassword,
          jiraSecPat: department.jiraSecPat,
          jiraMxPat: department.jiraMxPat,
          jiraLaPat: department.jiraLaPat,
          departmentPicUsernames: department.departmentPicUsernames ?? [],
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
            ...(canManagePic ? { departmentPicUsernames: values.departmentPicUsernames || [] } : {}),
          });
        }}
      >
        <Form.Item name="partName" label="Part Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        {canManagePic ? (
          <Form.Item name="departmentPicUsernames" label="Department PIC Users">
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              loading={picUsersQuery.isLoading}
              options={(picUsersQuery.data ?? []).map((user) => ({
                value: user.username,
                label: `${user.fullname} (${user.username})`,
              }))}
              placeholder="Search and select PIC users"
            />
          </Form.Item>
        ) : null}
        <Form.Item name="gitPat" label="Git PAT">
          <Input />
        </Form.Item>
        <Form.Item name="ecodePat" label="Ecode PAT">
          <Input />
        </Form.Item>
        <Form.Item name="gerritUserName" label="Gerrit Username">
          <Input />
        </Form.Item>
        <Form.Item name="gerritHttpPassword" label="Gerrit HTTP Password">
          <Input.Password />
        </Form.Item>
        <Form.Item name="jiraSecPat" label="Jira SEC PAT">
          <Input />
        </Form.Item>
        <Form.Item name="jiraMxPat" label="Jira MX PAT">
          <Input />
        </Form.Item>
        <Form.Item name="jiraLaPat" label="Jira LA PAT">
          <Input />
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
