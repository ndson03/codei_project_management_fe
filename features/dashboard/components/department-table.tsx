import { Table } from "antd";
import { type DepartmentResponse } from "@/lib/management-api";
import { TABLE_PAGE_SIZE_DEFAULT, TABLE_PAGE_SIZE_OPTIONS } from "@/lib/table-pagination";

type PaginationState = {
  current: number;
  pageSize: number;
};

type DepartmentTableProps = {
  departments: DepartmentResponse[];
  pagination: PaginationState;
  onPaginationChange: (next: PaginationState) => void;
  onRowSelect: (id: number) => void;
  getStickyContainer: () => HTMLElement;
};

export function DepartmentTable({
  departments,
  pagination,
  onPaginationChange,
  onRowSelect,
  getStickyContainer,
}: DepartmentTableProps) {
  return (
    <Table
      rowKey="partId"
      size="small"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: departments.length,
        showSizeChanger: true,
        pageSizeOptions: [...TABLE_PAGE_SIZE_OPTIONS],
      }}
      sticky={{
        offsetHeader: 0,
        getContainer: getStickyContainer,
      }}
      dataSource={departments}
      onChange={(nextPagination) => {
        onPaginationChange({
          current: nextPagination.current ?? 1,
          pageSize: nextPagination.pageSize ?? TABLE_PAGE_SIZE_DEFAULT,
        });
      }}
      scroll={{ x: 2000 }}
      onRow={(record) => ({
        onClick: () => onRowSelect(record.partId),
        className: "cursor-pointer",
      })}
      columns={[
        {
          title: "Part Name",
          dataIndex: "partName",
          width: 180,
        },
        {
          title: "Department PIC Username",
          dataIndex: "departmentPicUsernames",
          width: 200,
          render: (value: string[] | null) =>
            value && value.length ? value.join(", ") : "Unassigned",
        },
        {
          title: "Git PAT",
          dataIndex: "gitPat",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "Ecode PAT",
          dataIndex: "ecodePat",
          width: 180,
          render: (value: string) => value || "-",
        },
        {
          title: "Gerrit Username",
          dataIndex: "gerritUserName",
          width: 200,
          render: (value: string) => value || "-",
        },
        {
          title: "Gerrit HTTP Password",
          dataIndex: "gerritHttpPassword",
          width: 220,
          render: (value: string) => value || "-",
        },
        {
          title: "Jira SEC PAT",
          dataIndex: "jiraSecPat",
          width: 200,
          render: (value: string) => value || "-",
        },
        {
          title: "Jira MX PAT",
          dataIndex: "jiraMxPat",
          width: 200,
          render: (value: string) => value || "-",
        },
        {
          title: "Jira LA PAT",
          dataIndex: "jiraLaPat",
          width: 200,
          render: (value: string) => value || "-",
        },
      ]}
    />
  );
}
