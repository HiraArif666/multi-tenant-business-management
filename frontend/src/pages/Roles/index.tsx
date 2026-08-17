import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Switch,
  Select,
  Tag,
  Popconfirm,
  message,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  useRoles,
  useDeleteRole,
  useUpdateRoleStatus,
} from "../../hooks/useRoles";

const { Title } = Typography;

export default function Roles() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "active",
  });

  const updateStatusMutation = useUpdateRoleStatus();

  const handleStatusChange = async (
    record: any,
    checked: boolean,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: record.id,
        isActive: checked,
      });

      message.success(
        checked ? "Role activated" : "Role deactivated",
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to update status",
      );
    }
  };

  const { data, isLoading } = useRoles(filters);

  const deleteMutation = useDeleteRole();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);

      message.success("Role deleted successfully");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Delete failed"
      );
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },

    {
      title: "Description",
      dataIndex: "description",
    },

    {
      title: "Status / Active",

      render: (_: any, record: any) => {
        if (record.deletedAt) {
          return <Tag color="red">Deleted</Tag>;
        }
        return (
          <Switch
            checked={record.isActive}
            loading={updateStatusMutation.isPending}
            onChange={(checked) =>
              handleStatusChange(record, checked)
            }
          />
        );
      },
    },

    {
      title: "Permissions",

      render: (_: any, record: any) =>
        `${record.rolePermissions?.length || 0} assigned`,
    },

    {
      title: "Actions",

      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            disabled={!!record.deletedAt}
            onClick={() =>
              navigate(`/roles/edit/${record.id}`)
            }
          />

          {!record.deletedAt && (
            <Popconfirm
              title="Delete Role?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
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
          Roles ({data?.total || data?.data?.length || 0})
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/roles/new")}
        >
          Add New
        </Button>
      </Space>

      <Select
        value={filters.status}
        style={{ width: 160, marginBottom: 16 }}
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            status: value,
            page: 1,
          }))
        }
        options={[
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "All", value: "all" },
        ]}
      />

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
        pagination={{
          total: data?.total,
          pageSize: filters.limit,
          onChange: (page) =>
            setFilters((prev) => ({ ...prev, page })),
        }}
      />
    </Card>
  );
}