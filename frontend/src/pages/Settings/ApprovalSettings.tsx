import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Select,
  Button,
  Space,
  message,
  Form,
} from "antd";

import {
  useApprovableModules,
  useApproverOptions,
  useApprovalSetting,
  useUpsertApprovalSetting,
} from "../../hooks/useApprovalSettings";

const { Title, Text } = Typography;

export default function ApprovalSettings() {
  const [selectedModule, setSelectedModule] = useState<string | undefined>(
    undefined,
  );

  const [approverIds, setApproverIds] = useState<number[]>([]);

  const { data: modulesData, isLoading: modulesLoading } =
    useApprovableModules();

  const { data: approversData, isLoading: approversLoading } =
    useApproverOptions();

  const { data: settingData, isLoading: settingLoading } =
    useApprovalSetting(selectedModule);

  const upsertMutation = useUpsertApprovalSetting();

  useEffect(() => {
    if (settingData?.data) {
      setApproverIds(settingData.data.approverIds ?? []);
    } else {
      setApproverIds([]);
    }
  }, [settingData]);

  const moduleOptions =
    modulesData?.data?.map((m: any) => ({
      label: m.label,
      value: m.key,
    })) || [];

  const approverOptions =
    approversData?.data?.map((u: any) => ({
      label: `${u.name} (${u.username})`,
      value: u.id,
    })) || [];

  const handleSave = async () => {
    if (!selectedModule) {
      message.error("Please select a module first");
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        moduleName: selectedModule,
        approverIds,
      });

      message.success(
        "Approval settings saved successfully",
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to save approval settings",
      );
    }
  };

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Approval Settings
      </Title>

      <Text type="secondary">
        Choose a module, then pick which users are
        allowed to approve or reject entries in that
        module.
      </Text>

      <Form
        layout="vertical"
        style={{ marginTop: 24, maxWidth: 480 }}
      >
        <Form.Item label="Module">
          <Select
            placeholder="Select a module"
            loading={modulesLoading}
            value={selectedModule}
            onChange={(value) =>
              setSelectedModule(value)
            }
            options={moduleOptions}
          />
        </Form.Item>

        <Form.Item label="Approvers">
          <Select
            mode="multiple"
            placeholder="Select approvers"
            loading={approversLoading || settingLoading}
            disabled={!selectedModule}
            value={approverIds}
            onChange={(value) => setApproverIds(value)}
            options={approverOptions}
          />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            loading={upsertMutation.isPending}
            disabled={!selectedModule}
            onClick={handleSave}
          >
            Save
          </Button>
        </Space>
      </Form>
    </Card>
  );
}