import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Switch,
  Popconfirm,
  message,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  useRoles,
  useDeleteRole,
    useCreateRole,
  useUpdateRoleStatus,
} from "../../hooks/useRoles";

import { EditOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Roles() {
  const navigate = useNavigate();

  const [filters] = useState({
    page: 1,
    limit: 20,
  });

const createMutation =
  useCreateRole();
  const updateStatusMutation =
  useUpdateRoleStatus();
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
      checked
        ? "Role activated"
        : "Role deactivated",
    );
  } catch (error: any) {
    message.error(
      error?.response?.data?.message ??
        "Failed to update status",
    );
  }
};

  const { data, isLoading } =
    useRoles(filters);

  const deleteMutation =
    useDeleteRole();

  const handleDelete = async (
    id: number
  ) => {
    try {
      await deleteMutation.mutateAsync(id);

      message.success(
        "Role deleted successfully"
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Delete failed"
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
  title: "Active",

  render: (_: any, record: any) => (
    <Switch
      checked={record.isActive}
      loading={
        updateStatusMutation.isPending
      }
      onChange={(checked) =>
        handleStatusChange(
          record,
          checked,
        )
      }
    />
  ),
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
        onClick={() =>
          navigate(`/roles/edit/${record.id}`)
        }
      >
        
      </Button>

      <Popconfirm
        title="Delete Role?"
        onConfirm={() =>
          handleDelete(record.id)
        }
      >
        <Button
          danger
          icon={<DeleteOutlined />}
        >
          
        </Button>
      </Popconfirm>

    </Space>
  ),
},
  ];
  
  return (
    <Card>
      <Space
        style={{
          width: "100%",
          justifyContent:
            "space-between",
          marginBottom: 20,
        }}
      >
        <Title
          level={3}
          style={{ margin: 0 }}
        >
          Roles ({data?.data?.length || 0})
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate("/roles/new")
          }
        >
          Add New
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
        pagination={{
          total: data?.total,
          pageSize: filters.limit,
        }}
      />
    </Card>
  );
}