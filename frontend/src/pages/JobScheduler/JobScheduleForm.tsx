import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  Form,
  Select,
  TimePicker,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
} from "antd";

import dayjs from "dayjs";

import {
  useJobSchedule,
  useCreateJobSchedule,
  useUpdateJobSchedule,
} from "../../hooks/useJobSchedules";

import { getApproverOptions } from "../../services/approvalSettings";
import api from "../../services/api";

const { Title } = Typography;

const DAY_OPTIONS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const MONTH_DAY_OPTIONS = Array.from(
  { length: 31 },
  (_, i) => ({ label: String(i + 1), value: i + 1 }),
);

export default function JobScheduleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const frequency = Form.useWatch("frequency", form);

  const { data, isLoading } = useJobSchedule(
    isEdit ? Number(id) : undefined,
  );

  const createMutation = useCreateJobSchedule();
  const updateMutation = useUpdateJobSchedule();

  // Reused from Approval Settings — same "users in my BU" endpoint,
  // no need for a separate one just for this dropdown.
  const { data: usersData } = useQuery({
    queryKey: ["approver-options"],
    queryFn: getApproverOptions,
  });

  const { data: reportsData } = useQuery({
    queryKey: ["reports-for-scheduler"],
    queryFn: async () => {
      const response = await api.get("/api/reports", {
        params: { limit: 100 },
      });

      return response.data;
    },
  });

  useEffect(() => {
    if (isEdit && data?.data) {
      form.setFieldsValue({
        reportId: data.data.reportId,
        recipientUserIds: data.data.recipientUserIds,
        frequency: data.data.frequency,
        time: data.data.time
          ? dayjs(data.data.time, "HH:mm")
          : null,
        dayOfWeek: data.data.dayOfWeek ?? undefined,
        dayOfMonth: data.data.dayOfMonth ?? undefined,
      });
    }
  }, [data, form, isEdit]);

  const reportOptions =
    reportsData?.data?.map((r: any) => ({
      label: r.name,
      value: r.id,
    })) || [];

  const userOptions =
    usersData?.data?.map((u: any) => ({
      label: `${u.name} (${u.username})`,
      value: u.id,
    })) || [];

  const onFinish = async (values: any) => {
    const payload = {
      reportId: values.reportId,
      recipientUserIds: values.recipientUserIds,
      frequency: values.frequency,
      time: values.time.format("HH:mm"),
      dayOfWeek:
        values.frequency === "weekly"
          ? values.dayOfWeek
          : undefined,
      dayOfMonth:
        values.frequency === "monthly"
          ? values.dayOfMonth
          : undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: payload,
        });

        message.success("Schedule updated successfully");
      } else {
        await createMutation.mutateAsync(payload);

        message.success("Schedule created successfully");
      }

      navigate("/job-scheduler");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Operation failed",
      );
    }
  };

  if (isEdit && isLoading) {
    return <Spin fullscreen />;
  }

  return (
    <>
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Edit Schedule" : "Add Schedule"}
          </Title>

          <Space>
            <Button
              onClick={() =>
                navigate("/job-scheduler")
              }
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              form="job-schedule-form"
              loading={
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              Save
            </Button>
          </Space>
        </Row>
      </Card>

      <Card>
        <Form
          id="job-schedule-form"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ frequency: "daily" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="reportId"
                label="Report"
                rules={[
                  {
                    required: true,
                    message: "Please select a report",
                  },
                ]}
              >
                <Select
                  placeholder="Select a report"
                  options={reportOptions}
                />
              </Form.Item>

              <Form.Item
                name="recipientUserIds"
                label="Recipients"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one recipient",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select staff users"
                  options={userOptions}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="frequency"
                label="Frequency"
                rules={[
                  {
                    required: true,
                    message: "Please select a frequency",
                  },
                ]}
              >
                <Select
                  options={[
                    { label: "Daily", value: "daily" },
                    { label: "Weekly", value: "weekly" },
                    { label: "Monthly", value: "monthly" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="time"
                label="Time"
                rules={[
                  {
                    required: true,
                    message: "Please select a time",
                  },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              {frequency === "weekly" && (
                <Form.Item
                  name="dayOfWeek"
                  label="Day of Week"
                  rules={[
                    {
                      required: true,
                      message: "Please select a day",
                    },
                  ]}
                >
                  <Select options={DAY_OPTIONS} />
                </Form.Item>
              )}

              {frequency === "monthly" && (
                <Form.Item
                  name="dayOfMonth"
                  label="Day of Month"
                  rules={[
                    {
                      required: true,
                      message: "Please select a day",
                    },
                  ]}
                >
                  <Select options={MONTH_DAY_OPTIONS} />
                </Form.Item>
              )}
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
}