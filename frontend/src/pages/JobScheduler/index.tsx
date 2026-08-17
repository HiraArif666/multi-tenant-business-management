import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Switch,
  Tag,
  message,
  Popconfirm,
} from "antd";

import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  useJobSchedules,
  useUpdateJobSchedule,
  useDeleteJobSchedule,
} from "../../hooks/useJobSchedules";

const { Title } = Typography;

const DAY_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function describeSchedule(record: any) {
  if (record.frequency === "daily") {
    return `Daily at ${record.time}`;
  }

  if (record.frequency === "weekly") {
    return `Weekly on ${DAY_NAMES[record.dayOfWeek ?? 0]} at ${record.time}`;
  }

  return `Monthly on day ${record.dayOfMonth} at ${record.time}`;
}

export default function JobScheduler() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useJobSchedules(filters);
  const updateMutation = useUpdateJobSchedule();
  const deleteMutation = useDeleteJobSchedule();

  const handleToggleActive = async (
    record: any,
    checked: boolean,
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        data: { isActive: checked },
      });

      message.success(
        checked ? "Schedule activated" : "Schedule deactivated",
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to update schedule",
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Schedule deleted successfully");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to delete schedule",
      );
    }
  };

  const columns = [
    { title: "Report", dataIndex: "reportName" },

    {
      title: "Recipients",
      render: (_: any, record: any) => (
        <Space wrap>
          {(record.recipients || []).map((r: any) => (
            <Tag key={r.id}>{r.name ?? r.email ?? r.id}</Tag>
          ))}
        </Space>
      ),
    },

    {
      title: "Schedule",
      render: (_: any, record: any) =>
        describeSchedule(record),
    },

    {
      title: "Last Run",
      dataIndex: "lastRunAt",
      render: (value: string) =>
        value
          ? dayjs(value).format("DD-MMM-YYYY hh:mm A")
          : "Never",
    },

    {
      title: "Next Run",
      dataIndex: "nextRunAt",
      render: (value: string) =>
        value
          ? dayjs(value).format("DD-MMM-YYYY hh:mm A")
          : "-",
    },

    {
      title: "Active",
      render: (_: any, record: any) => (
        <Switch
          checked={record.isActive}
          loading={updateMutation.isPending}
          onChange={(checked) =>
            handleToggleActive(record, checked)
          }
        />
      ),
    },

    {
      title: "Actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            onClick={() =>
              navigate(
                `/job-scheduler/edit/${record.id}`,
              )
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete this schedule?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>
              Delete
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
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Job Scheduler ({data?.total ?? 0})
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/job-scheduler/new")}
        >
          Add New
        </Button>
      </Space>

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