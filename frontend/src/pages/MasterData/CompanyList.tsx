import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  ShopOutlined,
} from "@ant-design/icons";

import {
  useCompanies,
  useUpdateCompanyStatus,
} from "../../hooks/useCompanies";

import { getFileUrl } from "../../services/file";
import { MASTER_DATA_CONFIG } from "../../constants/masterData";

const { Title } = Typography;

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", {
    month: "long",
  });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function CompanyList() {
  const navigate = useNavigate();
  const { type } = useParams();

  const config = type ? MASTER_DATA_CONFIG[type] : undefined;

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "active",
  });

  const { data, isLoading } = useCompanies(
    config?.basePath ?? "",
    filters,
  );

  const updateStatusMutation = useUpdateCompanyStatus(
    config?.basePath ?? "",
  );

  if (!config) {
    return <Card>Unknown Master Data type.</Card>;
  }

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
          ? `${config.label} activated`
          : `${config.label} deactivated`,
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
      title: "Name",
      dataIndex: "name",

      render: (_: any, record: any) => (
        <Space>
          <Avatar
            size={32}
            shape="square"
            icon={<ShopOutlined />}
            src={getFileUrl(record.logo)}
          />

          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() =>
              navigate(
                `/master-data/${type}/edit/${record.id}`,
              )
            }
          >
            {record.name}
          </Button>
        </Space>
      ),
    },

    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Address", dataIndex: "address" },

    {
      title: "Contact Person Name",
      render: (_: any, record: any) =>
        record.admin?.name ?? "-",
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      render: formatDate,
    },

    { title: "Created By", dataIndex: "createdByName" },

    {
      title: "Modified At",
      dataIndex: "updatedAt",
      render: formatDate,
    },

    { title: "Modified By", dataIndex: "updatedByName" },

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
          {config.label}s ({data?.total ?? 0})
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate(`/master-data/${type}/new`)
          }
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