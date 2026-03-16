"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Empty, Typography, message } from "antd";
import { deleteDepartment, HttpError, type DepartmentResponse } from "@/lib/management-api";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import {
  canCreateDepartment,
  canDeleteDepartment,
  canUpdateDepartment,
} from "@/features/dashboard/lib/permissions";
import { TABLE_PAGE_SIZE_DEFAULT } from "@/lib/table-pagination";
import { DepartmentDetailCard } from "./department-detail-card";
import { DepartmentTable } from "./department-table";

type DepartmentViewProps = {
  selectedDepartmentId?: number;
};

function getHttpErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) return "Unexpected error";
  return `${error.status}: ${error.message}`;
}

export function DepartmentView({ selectedDepartmentId }: DepartmentViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({ current: 1, pageSize: TABLE_PAGE_SIZE_DEFAULT });

  const { accessMode, departments } = useDashboard();
  const selectedDepartment = departments.find((d) => d.partId === selectedDepartmentId);

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: async (_, deletedDeptId) => {
      queryClient.setQueryData<DepartmentResponse[]>(["departments"], (prev) =>
        (prev ?? []).filter((d) => d.partId !== deletedDeptId),
      );
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      message.success("Department deleted");
      router.push("/departments");
      router.refresh();
    },
    onError: (error) => {
      message.error(`Delete department failed: ${getHttpErrorMessage(error)}`);
    },
  });

  if (selectedDepartment) {
    return (
      <DepartmentDetailCard
        department={selectedDepartment}
        canUpdate={canUpdateDepartment(accessMode)}
        canDelete={canDeleteDepartment(accessMode)}
        deletePending={deleteDepartmentMutation.isPending}
        onEdit={() => router.push(`/departments/${selectedDepartment.partId}/edit`)}
        onDelete={() => deleteDepartmentMutation.mutate(selectedDepartment.partId)}
      />
    );
  }

  return (
    <Card className="shadow-sm">
      <Typography.Title level={4} className="!mb-3">
        Department List
      </Typography.Title>
      {departments.length === 0 ? (
        <Empty description="No departments available.">
          {canCreateDepartment(accessMode) ? (
            <Button type="primary" onClick={() => router.push("/departments/create")}>
              Create Department
            </Button>
          ) : null}
        </Empty>
      ) : (
        <DepartmentTable
          departments={departments}
          pagination={pagination}
          onPaginationChange={setPagination}
          onRowSelect={(id) => router.push(`/departments/${id}`)}
          getStickyContainer={() => document.getElementById("app-main-scroll") ?? document.body}
        />
      )}
    </Card>
  );
}
