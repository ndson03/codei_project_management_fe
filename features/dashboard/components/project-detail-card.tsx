import { Button, Card, Descriptions, Popconfirm, Space, Typography } from "antd";
import { type ProjectResponse } from "@/lib/management-api";

type ProjectDetailCardProps = {
  project: ProjectResponse;
  projectDepartmentName: string;
  canEdit: boolean;
  canDelete: boolean;
  deletePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProjectDetailCard({
  project,
  projectDepartmentName,
  canEdit,
  canDelete,
  deletePending,
  onEdit,
  onDelete,
}: ProjectDetailCardProps) {
  return (
    <Card className="shadow-sm">
      <Typography.Title level={4} className="!mb-4">
        Project Detail
      </Typography.Title>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Project Name">{project.projectName}</Descriptions.Item>
        <Descriptions.Item label="PICs">
          {project.pics.length ? project.pics.join(", ") : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Part Name">{projectDepartmentName}</Descriptions.Item>
        <Descriptions.Item label="Branch">{project.branch || "-"}</Descriptions.Item>
        <Descriptions.Item label="Notes">{project.notes || "-"}</Descriptions.Item>
        <Descriptions.Item label="Task Managements">
          {project.taskManagements.length ? project.taskManagements.join(", ") : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Repositories">
          {project.repositories.length ? project.repositories.join(", ") : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Dev White List">
          {project.devWhiteList.length ? project.devWhiteList.join(", ") : "-"}
        </Descriptions.Item>
      </Descriptions>

      {canEdit ? (
        <div className="mt-6">
          <Space wrap>
            <Button onClick={onEdit}>Edit Project Data</Button>

            {canDelete ? (
              <Popconfirm
                title="Delete this project?"
                description="This action cannot be undone."
                okText="Delete"
                okButtonProps={{ danger: true, loading: deletePending }}
                onConfirm={onDelete}
              >
                <Button danger>Delete Project</Button>
              </Popconfirm>
            ) : null}
          </Space>
        </div>
      ) : null}
    </Card>
  );
}
