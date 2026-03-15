"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Form, Input, Select, Space, Typography, message } from "antd";
import { getCurrentUser, getProjects, getUsers, HttpError, updateProjectData } from "@/lib/management-api";

type ProjectEditFormProps = {
  projectId: number;
};

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

export function ProjectEditForm({ projectId }: ProjectEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });

  const project = useMemo(
    () => (projectsQuery.data ?? []).find((item) => item.id === projectId),
    [projectsQuery.data, projectId],
  );

  const updateMutation = useMutation({
    mutationFn: updateProjectData,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      message.success("Project updated");
      router.replace(`/projects/${projectId}`);
      router.refresh();
    },
  });

  const canManagePmAssignments = currentUserQuery.data?.accessMode === "PIC";

  const usersQuery = useQuery({
    queryKey: ["users", "assignment", "PM", project?.departmentId],
    queryFn: () => getUsers({ assignmentType: "PM", deptId: project?.departmentId }),
    enabled: canManagePmAssignments && project?.departmentId != null,
  });

  if (projectsQuery.isLoading) {
    return <Card className="shadow-sm">Loading project...</Card>;
  }

  if (!project) {
    return (
      <Card className="shadow-sm">
        <Empty description="Project not found" />
      </Card>
    );
  }

  return (
    <Card className="shadow-sm" title={`Edit Project ${project.id}`}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          deptId: project.departmentId,
          projectName: project.projectName,
          branch: project.branch,
          notes: project.notes,
          taskManagements: project.taskManagements.join(", "),
          repositories: project.repositories.join(", "),
          pics: project.pics.join(", "),
          devWhiteList: project.devWhiteList.join(", "),
          pmUsernames: project.pmUsernames,
        }}
        onFinish={(values) => {
          updateMutation.mutate({
            projectId,
            deptId: values.deptId,
            projectName: values.projectName,
            branch: values.branch,
            notes: values.notes,
            taskManagements: parseCsv(values.taskManagements || ""),
            repositories: parseCsv(values.repositories || ""),
            pics: parseCsv(values.pics || ""),
            devWhiteList: parseCsv(values.devWhiteList || ""),
            pmUsernames: canManagePmAssignments ? values.pmUsernames || [] : project.pmUsernames,
          });
        }}
      >
        <Form.Item name="deptId" label="Department ID" rules={[{ required: true }]}>
          <Select
            disabled
            options={[{ value: project.departmentId, label: String(project.departmentId) }]}
          />
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
          <Input />
        </Form.Item>
        <Form.Item name="repositories" label="Repositories (comma separated)">
          <Input />
        </Form.Item>
        <Form.Item name="pics" label="PICs (comma separated)">
          <Input />
        </Form.Item>
        <Form.Item name="devWhiteList" label="Dev White List (comma separated)">
          <Input />
        </Form.Item>
        {canManagePmAssignments ? (
          <Form.Item name="pmUsernames" label="PM Users">
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
        ) : null}

        <Space>
          <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
            Save
          </Button>
          <Link href={`/projects/${projectId}`}>
            <Button>Back</Button>
          </Link>
        </Space>
      </Form>

      {updateMutation.error ? (
        <Alert className="!mt-3" type="error" showIcon message={renderMutationError(updateMutation.error)} />
      ) : null}

      {updateMutation.data ? (
        <Typography.Text type="success" className="!mt-3 block">
          Project updated successfully.
        </Typography.Text>
      ) : null}
    </Card>
  );
}
