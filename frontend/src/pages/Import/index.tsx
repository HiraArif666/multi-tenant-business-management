import { useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import {
  useConfirmImport,
  useDownloadImportTemplate,
  useImportModules,
  usePreviewImport,
} from "../../hooks/useImport";
import type { ImportPreviewRow } from "../../types/import";

const { Title, Text } = Typography;

export default function ImportPage() {
  const [module, setModule] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);

  const { data: modulesResponse, isLoading: modulesLoading } = useImportModules();
  const downloadTemplateMutation = useDownloadImportTemplate();
  const previewImportMutation = usePreviewImport();
  const confirmImportMutation = useConfirmImport();

  const modules = useMemo(() => {
    const responseData = modulesResponse?.data;

    if (Array.isArray(responseData)) {
      return responseData;
    }

    return responseData?.data ?? [];
  }, [modulesResponse]);

  const previewColumns = useMemo(() => {
    if (!previewRows.length) {
      return [];
    }

    const dataKeys = Object.keys(previewRows[0].data ?? {});

    return [
      {
        title: "Row",
        dataIndex: "rowIndex",
        width: 80,
      },
      ...dataKeys.map((key) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: ["data", key],
        render: (value: any) => value ?? "-",
      })),
      {
        title: "Errors",
        dataIndex: "errors",
        render: (errors: string[]) =>
          errors?.length ? (
            <Space direction="vertical" size="small">
              {errors.map((error) => (
                <Text key={error} type="danger">
                  {error}
                </Text>
              ))}
            </Space>
          ) : (
            <Text type="success">No errors</Text>
          ),
      },
    ];
  }, [previewRows]);

  const handleDownloadTemplate = async () => {
    if (!module) {
      message.warning("Please select a module first");
      return;
    }

    try {
      const blob = await downloadTemplateMutation.mutateAsync(module);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${module}-template.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      message.success("Template downloaded");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? "Failed to download template",
      );
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!module) {
      message.warning("Please select a module first");
      return;
    }

    setSelectedFile(file);
    setPreviewRows([]);

    try {
      const response = await previewImportMutation.mutateAsync({ module, file });
      setPreviewRows(response.data.rows);
      message.success("Preview generated successfully");
    } catch (error: any) {
      setSelectedFile(null);
      message.error(
        error?.response?.data?.message ?? "Failed to preview Excel file",
      );
    }
  };

  const handleConfirmImport = async () => {
    if (!module) {
      message.warning("Please select a module first");
      return;
    }

    const hasRowErrors = previewRows.some((row) => row.errors?.length);

    if (hasRowErrors) {
      message.error("Please fix the row errors before confirming import");
      return;
    }

    try {
      await confirmImportMutation.mutateAsync({ module, rows: previewRows });
      message.success("Excel rows imported successfully");
      setPreviewRows([]);
      setSelectedFile(null);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? "Failed to import Excel rows",
      );
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            Import Excel Data
          </Title>
          <Text type="secondary">
            Select a module, download the template, upload your Excel file, review the preview and confirm the import.
          </Text>
        </div>

        <Card size="small">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Select
                placeholder="Select module"
                value={module || undefined}
                loading={modulesLoading}
                style={{ width: "100%" }}
                onChange={(value) => {
                  setModule(value);
                  setPreviewRows([]);
                  setSelectedFile(null);
                }}
                options={modules.map((item: any) => ({
                  label: item.label,
                  value: item.value,
                }))}
              />
            </Col>

            <Col xs={24} md={8}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                loading={downloadTemplateMutation.isPending}
                disabled={!module}
                block
              >
                Download Template
              </Button>
            </Col>

            <Col xs={24} md={8}>
              <label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ display: "block", width: "100%" }}
                />
              </label>
            </Col>
          </Row>

          {selectedFile && (
            <div style={{ marginTop: 12 }}>
              <Text strong>Selected file:</Text> {selectedFile.name}
            </div>
          )}
        </Card>

        <Alert
          type="info"
          showIcon
          message="How it works"
          description="Download the template, add your data rows in the Excel sheet, upload the file, review any validation issues and confirm to save the rows into the selected module."
        />

        {previewRows.length > 0 && (
          <Card
            title="Preview"
            extra={
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmImport}
                loading={confirmImportMutation.isPending}
                disabled={previewRows.some((row) => row.errors?.length)}
              >
                Confirm Import
              </Button>
            }
          >
            <Table
              rowKey="rowIndex"
              columns={previewColumns}
              dataSource={previewRows}
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>
        )}

        {!previewRows.length && selectedFile && (
          <Card>
            <Space align="center">
              <FileExcelOutlined style={{ fontSize: 24 }} />
              <Text type="secondary">Upload a valid Excel file to generate a preview.</Text>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
}
