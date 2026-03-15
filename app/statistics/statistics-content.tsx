"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Table, Typography } from "antd";
import { getStatisticResults, HttpError } from "@/lib/management-api";
import { TABLE_PAGE_SIZE_DEFAULT, TABLE_PAGE_SIZE_OPTIONS } from "@/lib/table-pagination";

function renderError(error: unknown) {
  if (error instanceof HttpError) {
    return `${error.status}: ${error.message}`;
  }
  return "Unexpected error";
}

export function StatisticsContent() {
  const [pagination, setPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });

  const statisticsQuery = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatisticResults,
  });

  return (
    <Card className="shadow-sm" title="StatisticResult">
      {statisticsQuery.isLoading ? <Alert type="info" showIcon message="Loading statistics..." /> : null}
      {statisticsQuery.error ? (
        <Alert className="!mb-3" type="error" showIcon message={renderError(statisticsQuery.error)} />
      ) : null}

      <Table
        rowKey={(record) => `${record.issueKey ?? ""}:${record.prNumber ?? ""}`}
        size="small"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: statisticsQuery.data?.length ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [...TABLE_PAGE_SIZE_OPTIONS],
        }}
        dataSource={statisticsQuery.data ?? []}
        onChange={(nextPagination) => {
          setPagination({
            current: nextPagination.current ?? 1,
            pageSize: nextPagination.pageSize ?? TABLE_PAGE_SIZE_DEFAULT,
          });
        }}
        scroll={{ x: 2000 }}
        columns={[
          { title: "Issue Key", dataIndex: "issueKey", width: 140, render: (value: string | null) => value ?? "-" },
          { title: "PR Number", dataIndex: "prNumber", width: 120, render: (value: number | null) => value ?? "-" },
          { title: "Department ID", dataIndex: "departmentId", width: 140, render: (value: number | null) => value ?? "-" },
          { title: "Department Name", dataIndex: "departmentName", width: 180, render: (value: string | null) => value ?? "-" },
          { title: "Project", dataIndex: "project", width: 180, render: (value: string | null) => value ?? "-" },
          { title: "Created Time", dataIndex: "createdTime", width: 180, render: (value: string | null) => value ?? "-" },
          { title: "Merged Time", dataIndex: "mergedTime", width: 180, render: (value: string | null) => value ?? "-" },
          { title: "Week", dataIndex: "week", width: 120, render: (value: string | null) => value ?? "-" },
          { title: "AI Support", dataIndex: "aiSupport", width: 120, render: (value: string | null) => value ?? "-" },
          { title: "No. of Commit", dataIndex: "numberOfCommit", width: 140, render: (value: number | null) => value ?? "-" },
          { title: "No. of Segments", dataIndex: "numberOfSegments", width: 150, render: (value: number | null) => value ?? "-" },
          { title: "Pattern", dataIndex: "pattern", width: 140, render: (value: string | null) => value ?? "-" },
          { title: "No. of File", dataIndex: "numberOfFile", width: 120, render: (value: number | null) => value ?? "-" },
          { title: "AI LOC", dataIndex: "aiLoc", width: 120, render: (value: number | null) => value ?? "-" },
          { title: "First AI LOC", dataIndex: "firstAiLoc", width: 140, render: (value: number | null) => value ?? "-" },
          { title: "Developer LOC", dataIndex: "developerLoc", width: 140, render: (value: number | null) => value ?? "-" },
          { title: "AI Contribution", dataIndex: "aiContribution", width: 150, render: (value: number | null) => value ?? "-" },
          { title: "Service", dataIndex: "service", width: 140, render: (value: string | null) => value ?? "-" },
          { title: "Language", dataIndex: "language", width: 140, render: (value: string | null) => value ?? "-" },
          { title: "Task Type", dataIndex: "taskType", width: 140, render: (value: string | null) => value ?? "-" },
          { title: "Dev Type", dataIndex: "devType", width: 140, render: (value: string | null) => value ?? "-" },
          { title: "Cycle Time Hour", dataIndex: "cycleTimeHour", width: 150, render: (value: number | null) => value ?? "-" },
        ]}
      />

      {!statisticsQuery.isLoading && (statisticsQuery.data?.length ?? 0) === 0 ? (
        <Typography.Text type="secondary">No statistic results found.</Typography.Text>
      ) : null}
    </Card>
  );
}
