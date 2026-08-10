import { useState } from "react";

import {
  Card,
  Typography,
  Table,
  Select,
  Input,
  DatePicker,
  Tag,
  Button,
  Modal,
  Row,
  Col,
} from "antd";

import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  useAuditLogs,
  useAuditLogModules,
} from "../../hooks/useAuditLogs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ACTION_COLORS: Record<string, string> = {
  create: "green",
  update: "blue",
  delete: "red",
};

export default function AuditLog() {
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 20,
  });

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data, isLoading } = useAuditLogs(filters);
  const { data: modulesData } = useAuditLogModules();

  const moduleOptions =
    modulesData?.data?.map((m: string) => ({
      label: m,
      value: m,
    })) || [];

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "createdAt",
      render: (value: string) =>
        dayjs(value).format("DD-MMM-YYYY hh:mm A"),
    },

    { title: "User", dataIndex: "userName" },

    {
      title: "Action",
      dataIndex: "action",
      render: (value: string) => (
        <Tag color={ACTION_COLORS[value]}>
          {value.toUpperCase()}
        </Tag>
      ),
    },

    { title: "Module", dataIndex: "module" },
    { title: "Table", dataIndex: "tableName" },
    { title: "Record ID", dataIndex: "recordId" },
    { title: "IP Address", dataIndex: "ipAddress" },

    {
      title: "",
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedLog(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Audit Log
      </Title>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            allowClear
            placeholder="Module"
            style={{ width: 180 }}
            options={moduleOptions}
            onChange={(value) =>
              setFilters((prev: any) => ({
                ...prev,
                module: value,
                page: 1,
              }))
            }
          />
        </Col>

        <Col>
          <Select
            allowClear
            placeholder="Action"
            style={{ width: 150 }}
            options={[
              { label: "Create", value: "create" },
              { label: "Update", value: "update" },
              { label: "Delete", value: "delete" },
            ]}
            onChange={(value) =>
              setFilters((prev: any) => ({
                ...prev,
                action: value,
                page: 1,
              }))
            }
          />
        </Col>

        <Col>
          <Input.Search
            allowClear
            placeholder="Search by user"
            style={{ width: 220 }}
            onSearch={(value) =>
              setFilters((prev: any) => ({
                ...prev,
                search: value || undefined,
                page: 1,
              }))
            }
          />
        </Col>

        <Col>
          <RangePicker
            onChange={(dates) =>
              setFilters((prev: any) => ({
                ...prev,
                dateFrom: dates?.[0]
                  ? dates[0].startOf("day").toISOString()
                  : undefined,
                dateTo: dates?.[1]
                  ? dates[1].endOf("day").toISOString()
                  : undefined,
                page: 1,
              }))
            }
          />
        </Col>
      </Row>

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
            setFilters((prev: any) => ({
              ...prev,
              page,
            })),
        }}
      />

      <Modal
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        title="Audit Log Details"
        width={800}
      >
        {selectedLog && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text type="secondary">User</Text>
                <div>
                  {selectedLog.userName ?? "-"}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Timestamp</Text>
                <div>
                  {dayjs(selectedLog.createdAt).format(
                    "DD-MMM-YYYY hh:mm A",
                  )}
                </div>
              </Col>

              <Col span={12} style={{ marginTop: 12 }}>
                <Text type="secondary">
                  Module / Table
                </Text>
                <div>
                  {selectedLog.module} /{" "}
                  {selectedLog.tableName} (#
                  {selectedLog.recordId})
                </div>
              </Col>

              <Col span={12} style={{ marginTop: 12 }}>
                <Text type="secondary">
                  IP / Browser
                </Text>
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedLog.ipAddress ?? "-"} /{" "}
                  {selectedLog.userAgent ?? "-"}
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Before</Text>
                <pre
                  style={{
                    background: "#fafafa",
                    padding: 12,
                    borderRadius: 6,
                    maxHeight: 350,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {selectedLog.beforeValues
                    ? JSON.stringify(
                        selectedLog.beforeValues,
                        null,
                        2,
                      )
                    : "—"}
                </pre>
              </Col>

              <Col span={12}>
                <Text strong>After</Text>
                <pre
                  style={{
                    background: "#fafafa",
                    padding: 12,
                    borderRadius: 6,
                    maxHeight: 350,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {selectedLog.afterValues
                    ? JSON.stringify(
                        selectedLog.afterValues,
                        null,
                        2,
                      )
                    : "—"}
                </pre>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </Card>
  );
}