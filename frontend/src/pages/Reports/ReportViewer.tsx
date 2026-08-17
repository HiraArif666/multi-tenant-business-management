import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";

import {
  ArrowLeftOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import {
  useExportSavedReport,
  useGenerateReport,
  useReport,
} from "../../hooks/useReports";

const { Title, Text } = Typography;

export default function ReportViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const reportId = id ? Number(id) : undefined;

  const {
    data: reportResponse,
    isLoading: reportLoading,
    isError: reportError,
  } = useReport(reportId);

  const generateMutation = useGenerateReport();
  const exportMutation = useExportSavedReport();

  const [filters, setFilters] = useState<any>({
    startDate: undefined,
    endDate: undefined,
    isActive: "all",
    status: "all",
    search: "",
  });

  const [reportRows, setReportRows] = useState<any[]>([]);
  const [generatedColumns, setGeneratedColumns] = useState<any[]>([]);

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   data: {
   *     id,
   *     name,
   *     moduleKey,
   *     columns,
   *     filters
   *   }
   * }
   */
  const report = reportResponse?.data ?? reportResponse;

  /*
   * Populate filters from saved report
   */
  useEffect(() => {
    if (!report) return;

    const savedFilters = report.filters ?? {};

    setFilters({
      search: savedFilters.search ?? "",

      startDate: savedFilters.startDate
        ? dayjs(savedFilters.startDate)
        : undefined,

      endDate: savedFilters.endDate
        ? dayjs(savedFilters.endDate)
        : undefined,

      isActive:
        savedFilters.isActive ?? "all",

      status:
        savedFilters.status ?? "all",
    });
  }, [report]);

  /*
   * Generate the saved report
   *
   * The saved report contains:
   * - moduleKey
   * - columns
   * - filters
   *
   * We use those values to generate the actual
   * report rows again.
   */
  useEffect(() => {
    if (!report) return;

    const generateSavedReport = async () => {
      try {
        const savedFilters =
          report.filters ?? {};

        const payload = {
          moduleKey: report.moduleKey,

          // IMPORTANT:
          // Keep exactly the order saved by the user.
          columns: report.columns ?? [],

          filters: {
            ...savedFilters,

            startDate:
              savedFilters.startDate ??
              undefined,

            endDate:
              savedFilters.endDate ??
              undefined,

            ...(report.moduleKey === "expense"
              ? {
                  status:
                    savedFilters.status ??
                    "all",
                }
              : {
                  isActive:
                    savedFilters.isActive ??
                    "all",
                }),
          },
        };

        const response =
          await generateMutation.mutateAsync(
            payload
          );

        setReportRows(
          response?.data ?? []
        );

        setGeneratedColumns(
          response?.columns ?? []
        );
      } catch (error: any) {
        message.error(
          error?.response?.data?.message ??
            "Failed to generate saved report"
        );
      }
    };

    generateSavedReport();
  }, [report]);

  /*
   * Create table columns.
   *
   * report.columns is the source of truth for
   * the user's saved column order.
   */
  const tableColumns = useMemo(() => {
    if (!report?.columns) {
      return [];
    }

    return report.columns.map(
      (columnKey: string) => {
        const generatedColumn =
          generatedColumns.find(
            (column: any) =>
              column.key === columnKey ||
              column.dataIndex === columnKey
          );

        return {
          title:
            generatedColumn?.label ??
            generatedColumn?.title ??
            columnKey,

          dataIndex: columnKey,

          key: columnKey,

          render: (value: any) =>
            value ?? "-",
        };
      }
    );
  }, [
    report?.columns,
    generatedColumns,
  ]);

  /*
   * Export saved report
   */
  const handleExport = async () => {
    if (!reportId) return;

    try {
      const blob =
        await exportMutation.mutateAsync(
          reportId
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${report?.name ?? "report"}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      message.success(
        "Report exported successfully"
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to export report"
      );
    }
  };

  /*
   * Invalid ID
   */
  if (
    !reportId ||
    Number.isNaN(reportId)
  ) {
    return (
      <Alert
        type="error"
        message="Invalid report ID"
        description="The report ID in the URL is invalid."
        showIcon
      />
    );
  }

  /*
   * Loading saved report
   */
  if (reportLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  /*
   * Error loading saved report
   */
  if (reportError || !report) {
    return (
      <Alert
        type="error"
        message="Unable to load report"
        description="The saved report could not be loaded."
        showIcon
      />
    );
  }

  const isExpense =
    report.moduleKey === "expense";

  return (
    <div>
      <Space
        direction="vertical"
        size="large"
        style={{
          width: "100%",
        }}
      >
        {/* =====================================================
            HEADER / TITLE
        ====================================================== */}

        <Card>
          <Space
            style={{
              width: "100%",
              justifyContent:
                "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Button
                icon={
                  <ArrowLeftOutlined />
                }
                onClick={() =>
                  navigate("/reports")
                }
                style={{
                  marginBottom: 12,
                }}
              >
                Back to Reports
              </Button>

              <Title
                level={3}
                style={{
                  margin: 0,
                }}
              >
                {report.name}
              </Title>

              <Text type="secondary">
                {report.moduleKey}
              </Text>
            </div>

            <Button
              type="primary"
              icon={
                <DownloadOutlined />
              }
              loading={
                exportMutation.isPending
              }
              onClick={handleExport}
            >
              Export
            </Button>
          </Space>
        </Card>

        {/* =====================================================
            SAVED FILTERS
        ====================================================== */}

        <Card title="Filters">
          <Row gutter={[16, 16]}>
            {/* Start Date */}
            <Col span={6}>
              <div
                style={{
                  marginBottom: 6,
                }}
              >
                <Text strong>
                  Start Date
                </Text>
              </div>

              <DatePicker
                style={{
                  width: "100%",
                }}
                value={
                  filters.startDate
                }
                disabled
              />
            </Col>

            {/* End Date */}
            <Col span={6}>
              <div
                style={{
                  marginBottom: 6,
                }}
              >
                <Text strong>
                  End Date
                </Text>
              </div>

              <DatePicker
                style={{
                  width: "100%",
                }}
                value={
                  filters.endDate
                }
                disabled
              />
            </Col>

            {/* Status */}
            <Col span={6}>
              <div
                style={{
                  marginBottom: 6,
                }}
              >
                <Text strong>
                  {isExpense
                    ? "Expense Status"
                    : "Status / Active"}
                </Text>
              </div>

              {isExpense ? (
                <Select
                  style={{
                    width: "100%",
                  }}
                  value={
                    filters.status ??
                    "all"
                  }
                  disabled
                  options={[
                    {
                      label: "All",
                      value: "all",
                    },
                    {
                      label: "Pending",
                      value: "pending",
                    },
                    {
                      label: "Approved",
                      value: "approved",
                    },
                    {
                      label: "Rejected",
                      value: "rejected",
                    },
                  ]}
                />
              ) : (
                <Select
                  style={{
                    width: "100%",
                  }}
                  value={
                    filters.isActive ??
                    "all"
                  }
                  disabled
                  options={[
                    {
                      label: "All",
                      value: "all",
                    },
                    {
                      label: "Active",
                      value: "active",
                    },
                    {
                      label: "Inactive",
                      value: "inactive",
                    },
                  ]}
                />
              )}
            </Col>

            {/* Search */}
            <Col span={6}>
              <div
                style={{
                  marginBottom: 6,
                }}
              >
                <Text strong>
                  Search
                </Text>
              </div>

              <Input
                value={
                  filters.search ?? ""
                }
                disabled
                placeholder="Search..."
              />
            </Col>
          </Row>
        </Card>

        {/* =====================================================
            SAVED COLUMNS
        ====================================================== */}

        <Card title="Report Columns">
          <Space wrap>
            {(report.columns ?? []).map(
              (column: string) => (
                <Tag key={column}>
                  {column}
                </Tag>
              )
            )}
          </Space>
        </Card>

        {/* =====================================================
            REPORT TABLE
        ====================================================== */}

        <Card title="Report">
          {generateMutation.isPending ? (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                padding: 50,
              }}
            >
              <Spin size="large" />
            </div>
          ) : reportRows.length === 0 ? (
            <Alert
              type="info"
              message="No data found"
              description="No records match the saved report filters."
              showIcon
            />
          ) : (
            <Table
              rowKey={(
                record,
                index
              ) =>
                `${index}-${record.id ?? "row"}`
              }
              dataSource={reportRows}
              columns={tableColumns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
              scroll={{
                x: true,
              }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
}