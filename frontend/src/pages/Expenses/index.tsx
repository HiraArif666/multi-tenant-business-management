import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Select,
  Tag,
  message,
  Popconfirm,
} from "antd";

import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import {
  useExpenses,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
} from "../../hooks/useExpenses";
import { exportExpenses } from "../../services/expense";

import { hasPermission } from "../../utils/permissions";

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export default function Expenses() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: undefined as string | undefined,
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useExpenses(filters);

  const deleteMutation = useDeleteExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const canApprove = hasPermission("expense.approve");
  const canEdit = hasPermission("expense.edit");
  const canDelete = hasPermission("expense.delete");
  const canExport = hasPermission("expense.export");

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Expense deleted successfully");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to delete expense",
      );
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success("Expense approved");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to approve expense",
      );
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync(id);
      message.success("Expense rejected");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to reject expense",
      );
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportExpenses({
        status: filters.status,
      });
      const blob = new Blob([data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "expenses.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      message.success("Excel file downloaded");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to export expenses",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Description", dataIndex: "description" },

    {
      title: "Amount",
      dataIndex: "amount",
      render: (value: number) =>
        `Rs. ${Number(value).toLocaleString()}`,
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (value: string, record: any) => {
        if (record.deletedAt) {
          return <Tag color="red">DELETED</Tag>;
        }
        return (
          <Tag color={STATUS_COLORS[value]}>
            {value?.toUpperCase()}
          </Tag>
        );
      },
    },

    {
      title: "Decided By",
      render: (_: any, record: any) =>
        record.approver?.name ?? "-",
    },

    { title: "Created By", dataIndex: "createdByName" },

    {
      title: "Actions",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "pending" && canEdit && (
            <Button
              size="small"
              onClick={() =>
                navigate(
                  `/expenses/edit/${record.id}`,
                )
              }
            >
              Edit
            </Button>
          )}

          {record.status === "pending" && canDelete && (
            <Popconfirm
              title="Delete this expense?"
              onConfirm={() =>
                handleDelete(record.id)
              }
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          )}

          {record.status === "pending" &&
            canApprove && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={
                    approveMutation.isPending
                  }
                  onClick={() =>
                    handleApprove(record.id)
                  }
                >
                  Approve
                </Button>

                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  loading={
                    rejectMutation.isPending
                  }
                  onClick={() =>
                    handleReject(record.id)
                  }
                >
                  Reject
                </Button>
              </>
            )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Expenses ({data?.total ?? 0})
        </Title>

        <Space>
          {canExport && (
            <Button
              icon={<PlusOutlined />}
              type="default"
              loading={isExporting}
              onClick={handleExport}
            >
              Export Excel
            </Button>
          )}

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/expenses/new")}
          >
            Add New
          </Button>
        </Space>
      </Space>

      <Select
        allowClear
        placeholder="Filter by status"
        style={{ width: 180, marginBottom: 16 }}
        value={filters.status}
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            status: value,
            page: 1,
          }))
        }
        options={[
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Inactive / Deleted", value: "inactive" },
          { label: "All", value: "all" },
        ]}
      />

      <div style={{ marginBottom: 16 }}>
        <strong>Total Amount: </strong>
        Rs. {Number(data?.totalAmount ?? 0).toLocaleString()}
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
        scroll={{ x: true }}
        pagination={{
          current: filters.page,
          total: data?.total,
          pageSize: filters.limit,
          onChange: (page) =>
            setFilters((prev) => ({ ...prev, page })),
        }}
      />
    </Card>
  );
}