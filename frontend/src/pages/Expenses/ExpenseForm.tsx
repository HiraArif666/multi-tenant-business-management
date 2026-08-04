import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
  Alert,
} from "antd";

import {
  useExpense,
  useCreateExpense,
  useUpdateExpense,
} from "../../hooks/useExpenses";

const { Title } = Typography;
const { TextArea } = Input;

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();

  const { data, isLoading } = useExpense(
    isEdit ? Number(id) : undefined,
  );

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  useEffect(() => {
    if (isEdit && data?.data) {
      form.setFieldsValue({
        title: data.data.title,
        description: data.data.description,
        amount: data.data.amount,
      });
    }
  }, [data, form, isEdit]);

  const isLocked =
    isEdit && data?.data && data.data.status !== "pending";

  const onFinish = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: values,
        });

        message.success("Expense updated successfully");
      } else {
        await createMutation.mutateAsync(values);

        message.success("Expense created successfully");
      }

      navigate("/expenses");
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
            {isEdit ? "Edit Expense" : "Add Expense"}
          </Title>

          <Space>
            <Button
              onClick={() => navigate("/expenses")}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              form="expense-form"
              disabled={!!isLocked}
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

      {isLocked && (
        <Alert
          style={{ marginBottom: 20 }}
          type="warning"
          showIcon
          message={`This expense has already been ${data?.data.status}, so it can no longer be edited.`}
        />
      )}

      <Card>
        <Form
          id="expense-form"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={!!isLocked}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="title"
                label="Title"
                rules={[
                  {
                    required: true,
                    message: "Please enter a title",
                  },
                ]}
              >
                <Input placeholder="e.g. Office Supplies" />
              </Form.Item>

              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  {
                    required: true,
                    message: "Please enter an amount",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="e.g. 2500"
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea
                  rows={5}
                  placeholder="Optional details about this expense"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
}