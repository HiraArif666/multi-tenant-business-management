import { Button, Popconfirm, Space, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

interface Props {
  data: any[];
  loading?: boolean;
  activeView: boolean;
  editPath: string;
  onDelete: (id: number) => void;
}

const formatDate = (value: string) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ListingTable({
  data,
  loading,
  activeView,
  editPath,
  onDelete,
}: Props) {
  const columns: any[] = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_: any, record: any) =>
        activeView ? (
          <Link to={`${editPath}/${record.id}`}>
            {record.name}
          </Link>
        ) : (
          <span>{record.name}</span>
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: formatDate,
    },
    {
      title: "Created By",
      dataIndex: "createdByName",
      render: (value: any) => value || "-",
    },
{
  title: "Modified At",
  dataIndex: "updatedAt",
  render: (_: any, record: any) => {
    return record.updatedByName
      ? formatDate(record.updatedAt)
      : "";
  },
},
{
  title: "Modified By",
  dataIndex: "updatedByName",
  render: (value: any) => value || "",
},
  ];

  if (!activeView) {
    columns.push(
      {
        title: "Deleted At",
        dataIndex: "deletedAt",
        render: (_: any, record: any) => {
  if (!record.updatedByName) return "-";
  return formatDate(record.updatedAt);
},
      },
      {
        title: "Deleted By",
        dataIndex: "deletedByName",
        render: (value: any) => value || "-",
      }
    );
  }

  if (activeView) {
    columns.push({
      title: "Actions",
      align: "center",
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Delete Business Unit?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() => onDelete(record.id)}
          >
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
    />
  );
}