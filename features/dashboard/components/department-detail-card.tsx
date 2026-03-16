import { Button, Card, Descriptions, Popconfirm, Space, Typography } from "antd";
import { type DepartmentResponse } from "@/lib/management-api";

type DepartmentDetailCardProps = {
  department: DepartmentResponse;
  canUpdate: boolean;
  canDelete: boolean;
  deletePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function DepartmentDetailCard({
  department,
  canUpdate,
  canDelete,
  deletePending,
  onEdit,
  onDelete,
}: DepartmentDetailCardProps) {
  return (
    <Card className="shadow-sm">
      <Typography.Title level={4} className="!mb-4">
        Department Detail
      </Typography.Title>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Part Name">{department.partName}</Descriptions.Item>
        <Descriptions.Item label="Department PIC Username">
          {department.departmentPicUsernames?.length
            ? department.departmentPicUsernames.join(", ")
            : "Unassigned"}
        </Descriptions.Item>
        <Descriptions.Item label="Git PAT">{department.gitPat || "-"}</Descriptions.Item>
        <Descriptions.Item label="Ecode PAT">{department.ecodePat || "-"}</Descriptions.Item>
        <Descriptions.Item label="Gerrit Username">{department.gerritUserName || "-"}</Descriptions.Item>
        <Descriptions.Item label="Gerrit HTTP Password">{department.gerritHttpPassword || "-"}</Descriptions.Item>
        <Descriptions.Item label="Jira SEC PAT">{department.jiraSecPat || "-"}</Descriptions.Item>
        <Descriptions.Item label="Jira MX PAT">{department.jiraMxPat || "-"}</Descriptions.Item>
        <Descriptions.Item label="Jira LA PAT">{department.jiraLaPat || "-"}</Descriptions.Item>
      </Descriptions>

      {canUpdate ? (
        <div className="mt-6">
          <Space wrap>
            <Button onClick={onEdit}>Edit Department</Button>

            {canDelete ? (
              <Popconfirm
                title="Delete this department?"
                description="This action cannot be undone."
                okText="Delete"
                okButtonProps={{ danger: true, loading: deletePending }}
                onConfirm={onDelete}
              >
                <Button danger>Delete Department</Button>
              </Popconfirm>
            ) : null}
          </Space>
        </div>
      ) : null}
    </Card>
  );
}
