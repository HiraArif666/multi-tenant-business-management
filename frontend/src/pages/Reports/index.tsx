import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  FileSearchOutlined,
  SaveOutlined,
} from "@ant-design/icons";


import {
  useCreateReport,
  useDeleteReport,
  useExportReport,
  useGenerateReport,
  useReportModules,
  useReportsList,
} from "../../hooks/useReports";

import { hasPermission } from "../../utils/permissions";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function ReportsPage() {
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<any[]>([]);

  const [filters, setFilters] = useState<any>({
    startDate: undefined,
    endDate: undefined,
    isActive: "all",
    status: "all",
    search: "",
  });

  const [reportName, setReportName] = useState("");
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [generatedColumns, setGeneratedColumns] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  const {
    data: modulesResponse,
    isLoading: modulesLoading,
  } = useReportModules();

  const {
    data: reportsResponse,
    isLoading: reportsLoading,
  } = useReportsList();

  const generateMutation = useGenerateReport();
  const createReportMutation = useCreateReport();
  const exportMutation = useExportReport();
  const deleteMutation = useDeleteReport();

  const navigate = useNavigate();

  const modules = useMemo(() => {
    const list = modulesResponse?.data ?? modulesResponse ?? [];
    return Array.isArray(list) ? list : [];
  }, [modulesResponse]);

  useEffect(() => {
    const current = modules.find(
      (item: any) => item.key === selectedModule
    );

    const columns = current?.columns ?? [];

    setAvailableColumns(columns);
    setSelectedColumns(
      columns.map((c: any) => c.key)
    );

    // Reset module-specific filters
    setFilters((prev: any) => ({
      ...prev,
      isActive: "all",
      status: "all",
    }));
  }, [selectedModule, modules]);

  useEffect(() => {
    const rows =
      reportsResponse?.data ?? reportsResponse ?? [];

    setSavedReports(
      Array.isArray(rows) ? rows : []
    );
  }, [reportsResponse]);

  const canView = hasPermission("reports.view");
  const canAdd = hasPermission("reports.add");
  const canExport = hasPermission("reports.export");
  const canDelete = hasPermission("reports.delete");

  /*
   * Generate Report
   */
  const handleGenerate = async () => {
    if (!selectedModule) {
      message.warning(
        "Please select a main module first"
      );
      return;
    }

    try {
      const payload = {
        moduleKey: selectedModule,
        columns: selectedColumns,

        filters: {
          ...filters,

          startDate:
            filters.startDate ?? undefined,

          endDate:
            filters.endDate ?? undefined,

          ...(selectedModule === "expense"
            ? {
                status:
                  filters.status ?? "all",
              }
            : {
                isActive:
                  filters.isActive === "all"
                    ? "all"
                    : filters.isActive === "active",
              }),
        },
      };

      const response =
        await generateMutation.mutateAsync(
          payload
        );

      setReportRows(response.data ?? []);
      setGeneratedColumns(
        response.columns ?? []
      );

      message.success(
        "Report generated successfully"
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to generate report"
      );
    }
  };

  /*
   * Save Report
   */
  const handleSave = async () => {
    if (!selectedModule) {
      message.warning(
        "Please select a module first"
      );
      return;
    }

    if (!reportName.trim()) {
      message.warning(
        "Please enter a report name"
      );
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        name: reportName,
        moduleKey: selectedModule,
        columns: selectedColumns,

        filters: {
          ...filters,

          startDate:
            filters.startDate ?? undefined,

          endDate:
            filters.endDate ?? undefined,

          ...(selectedModule === "expense"
            ? {
                status:
                  filters.status ?? "all",
              }
            : {
                isActive:
                  filters.isActive === "all"
                    ? "all"
                    : filters.isActive === "active",
              }),
        },
      });

      message.success(
        "Report saved successfully"
      );

      setReportName("");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to save report"
      );
    }
  };

  /*
   * Export Current Report
   */
  const handleExportExcel = async () => {
    if (!selectedModule) {
      message.warning(
        "Please select a module first"
      );
      return;
    }

    try {
      const blob =
        await exportMutation.mutateAsync({
          moduleKey: selectedModule,
          columns: selectedColumns,

          filters: {
            ...filters,

            startDate:
              filters.startDate ?? undefined,

            endDate:
              filters.endDate ?? undefined,

            ...(selectedModule === "expense"
              ? {
                  status:
                    filters.status ?? "all",
                }
              : {
                  isActive:
                    filters.isActive === "all"
                      ? "all"
                      : filters.isActive ===
                        "active",
                }),
          },
        });

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = `${selectedModule}-report.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      message.success(
        "Excel export downloaded"
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to export Excel"
      );
    }
  };

  /*
   * Delete Saved Report
   */
  const handleDeleteSavedReport = async (
    id: number
  ) => {
    try {
      await deleteMutation.mutateAsync(id);

      message.success(
        "Saved report deleted"
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to delete saved report"
      );
    }
  };

  /*
   * Generated table columns
   */
  const tableColumns: ColumnsType<any> =
    useMemo(
      () =>
        generatedColumns.map(
          (col: any) => ({
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            render: (value: any) =>
              value ?? "-",
          })
        ),
      [generatedColumns]
    );

  return (
    <div>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%" }}
      >
        {/* Header */}
        <Card>
          <Title
            level={3}
            style={{ marginBottom: 8 }}
          >
            Report Builder
          </Title>

          <Text type="secondary">
            Choose a main module, select
            columns, apply filters, preview,
            save and export.
          </Text>
        </Card>

        {/* Report Builder */}
        <Card>
          <Row gutter={[16, 16]}>
            {/* Module */}
            <Col span={8}>
              <Select
                placeholder="Select main module"
                value={
                  selectedModule || undefined
                }
                style={{ width: "100%" }}
                loading={modulesLoading}
                onChange={(value) =>
                  setSelectedModule(value)
                }
                options={modules.map(
                  (item: any) => ({
                    label: item.label,
                    value: item.key,
                  })
                )}
              />
            </Col>

            {/* Report Name */}
            <Col span={8}>
              <Input
                value={reportName}
                onChange={(e) =>
                  setReportName(
                    e.target.value
                  )
                }
                placeholder="Report name"
              />
            </Col>

            {/* Buttons */}
            <Col span={8}>
              <Space>
                <Button
                  type="primary"
                  icon={
                    <FileSearchOutlined />
                  }
                  onClick={handleGenerate}
                  loading={
                    generateMutation.isPending
                  }
                  disabled={
                    !canView ||
                    !selectedModule
                  }
                >
                  Generate
                </Button>

                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={
                    createReportMutation.isPending
                  }
                  disabled={
                    !canAdd ||
                    !selectedModule
                  }
                >
                  Save Report
                </Button>

                <Button
                  icon={
                    <DownloadOutlined />
                  }
                  onClick={
                    handleExportExcel
                  }
                  loading={
                    exportMutation.isPending
                  }
                  disabled={
                    !canExport ||
                    !selectedModule
                  }
                >
                  Excel
                </Button>
              </Space>
            </Col>
          </Row>

          <Divider />

          {/* Filters */}
          <Row gutter={[16, 16]}>
            {/* Start Date */}
            <Col span={6}>
              <Form.Item label="Start Date">
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  value={
                    filters.startDate
                      ? filters.startDate
                      : undefined
                  }
                  onChange={(date) =>
                    setFilters(
                      (prev: any) => ({
                        ...prev,
                        startDate: date,
                      })
                    )
                  }
                />
              </Form.Item>
            </Col>

            {/* End Date */}
            <Col span={6}>
              <Form.Item label="End Date">
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  value={
                    filters.endDate
                      ? filters.endDate
                      : undefined
                  }
                  onChange={(date) =>
                    setFilters(
                      (prev: any) => ({
                        ...prev,
                        endDate: date,
                      })
                    )
                  }
                />
              </Form.Item>
            </Col>

            {/* Status */}
            <Col span={6}>
              <Form.Item
                label={
                  selectedModule ===
                  "expense"
                    ? "Expense Status"
                    : "Status / Active"
                }
              >
                {selectedModule ===
                "expense" ? (
                  <Select
                    style={{
                      width: "100%",
                    }}
                    value={
                      filters.status ??
                      "all"
                    }
                    onChange={(value) =>
                      setFilters(
                        (prev: any) => ({
                          ...prev,
                          status: value,
                        })
                      )
                    }
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
                    onChange={(value) =>
                      setFilters(
                        (prev: any) => ({
                          ...prev,
                          isActive: value,
                        })
                      )
                    }
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
              </Form.Item>
            </Col>

            {/* Search */}
            <Col span={6}>
              <Form.Item label="Search">
                <Input
                  value={
                    filters.search
                  }
                  onChange={(e) =>
                    setFilters(
                      (prev: any) => ({
                        ...prev,
                        search:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Search..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Columns */}
          <Title level={5}>
            Select Report Columns
          </Title>

          <Select
            mode="multiple"
            style={{
              width: "100%",
            }}
            placeholder="Choose columns for the report"
            value={selectedColumns}
            options={availableColumns.map(
              (col: any) => ({
                label: col.label,
                value: col.key,
              })
            )}
            onChange={(value) =>
              setSelectedColumns(value)
            }
          />
        </Card>

        {/* Generated Preview */}
        {reportRows.length > 0 && (
          <Card>
            <Title level={4}>
              Generated Report Preview
            </Title>

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
              }}
              scroll={{
                x: true,
              }}
            />
          </Card>
        )}

        {/* Saved Reports */}
        <Card>
          <Title level={4}>
            Saved Reports
          </Title>

          {savedReports.length === 0 ? (
            <Alert
              type="info"
              message="No saved reports yet."
            />
          ) : (
            <Table
              rowKey="id"
              dataSource={savedReports}
              loading={reportsLoading}
              columns={[
                {
                  title: "Name",
                  dataIndex: "name",
                },

                {
                  title: "Module",
                  dataIndex: "moduleKey",
                },

                {
                  title: "Columns",
                  dataIndex: "columns",
                  render: (
                    value: string[]
                  ) => (
                    <Space wrap>
                      {(value ?? []).map(
                        (
                          item: string
                        ) => (
                          <Tag key={item}>
                            {item}
                          </Tag>
                        )
                      )}
                    </Space>
                  ),
                },

                {
                  title: "Actions",
                  render: (
                    _: any,
                    record: any
                  ) => (
                    <Space>
                      <Button
                        size="small"
                        onClick={() =>
                          navigate(
                            `/reports/view/${record.id}`
                          )
                        }
                      >
                        Open
                      </Button>

                      <Button
                        size="small"
                        danger
                        disabled={
                          !canDelete
                        }
                        onClick={() =>
                          handleDeleteSavedReport(
                            record.id
                          )
                        }
                      >
                        Delete
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </Space>
    </div>
  );
}