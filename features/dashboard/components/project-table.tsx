import { Table } from "antd";
import { type ProjectResponse } from "@/lib/management-api";
import { TABLE_PAGE_SIZE_DEFAULT, TABLE_PAGE_SIZE_OPTIONS } from "@/lib/table-pagination";

type PaginationState = {
  current: number;
  pageSize: number;
};

type ProjectTableProps = {
  projects: ProjectResponse[];
  pagination: PaginationState;
  onPaginationChange: (next: PaginationState) => void;
  onRowSelect: (id: number) => void;
  getStickyContainer: () => HTMLElement;
};

export function ProjectTable({
  projects,
  pagination,
  onPaginationChange,
  onRowSelect,
  getStickyContainer,
}: ProjectTableProps) {
  return (
    <Table
      rowKey="id"
      size="small"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: projects.length,
        showSizeChanger: true,
        pageSizeOptions: [...TABLE_PAGE_SIZE_OPTIONS],
      }}
      sticky={{
        offsetHeader: 0,
        getContainer: getStickyContainer,
      }}
      dataSource={projects}
      onChange={(nextPagination) => {
        onPaginationChange({
          current: nextPagination.current ?? 1,
          pageSize: nextPagination.pageSize ?? TABLE_PAGE_SIZE_DEFAULT,
        });
      }}
      onRow={(record) => ({
        onClick: () => onRowSelect(record.id),
        className: "cursor-pointer",
      })}
      scroll={{ x: 1200 }}
      columns={[
        {
          title: "Project Name",
          dataIndex: "projectName",
          width: 220,
        },
        {
          title: "Branch",
          dataIndex: "branch",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "Notes",
          dataIndex: "notes",
          width: 220,
          render: (value: string) => value || "-",
        },
        {
          title: "Task Managements",
          dataIndex: "taskManagements",
          width: 220,
          render: (value: string[]) => (value.length ? value.join(", ") : "-"),
        },
        {
          title: "Repositories",
          dataIndex: "repositories",
          width: 220,
          render: (value: string[]) => (value.length ? value.join(", ") : "-"),
        },
        {
          title: "PICs",
          dataIndex: "pics",
          width: 180,
          render: (value: string[]) => (value.length ? value.join(", ") : "-"),
        },
        {
          title: "Dev White List",
          dataIndex: "devWhiteList",
          width: 220,
          render: (value: string[]) => (value.length ? value.join(", ") : "-"),
        },
      ]}
    />
  );
}
