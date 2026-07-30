import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFileUrl } from "../../services/file";
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Switch,
  Select,
  Avatar,
  message,
} from "antd";

import {
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  useUsers,
  useUpdateUserStatus,
} from "../../hooks/useUsers";

const { Title } = Typography;

export default function Users() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "active",
  });

  const { data, isLoading } = useUsers(filters);

  const updateStatusMutation = useUpdateUserStatus();

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
        checked ? "User activated" : "User deactivated",
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to update status",
      );
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "name",

      render: (_: any, record: any) => (
        <Space>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            src={getFileUrl(record.profilePicture)}
          />

          <span>{record.name}</span>
        </Space>
      ),
    },

    {
      title: "Username",
      dataIndex: "username",

      render: (_: any, record: any) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() =>
            navigate(`/users/edit/${record.id}`)
          }
        >
          {record.username}
        </Button>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
    },

    {
      title: "Active",

      render: (_: any, record: any) => (
        <Switch
          checked={record.isActive}
          loading={updateStatusMutation.isPending}
          onChange={(checked) =>
            handleStatusChange(record, checked)
          }
        />
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
          Users ({data?.total ?? 0})
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/users/new")}
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