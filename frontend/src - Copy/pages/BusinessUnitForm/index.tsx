import { useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Switch,
  Typography,
  message,
} from "antd";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useBusinessUnit,
  useCreateBusinessUnit,
  useUpdateBusinessUnit,
} from "../../hooks/useBusinessUnits";

const { Title } = Typography;

export default function BusinessUnitForm() {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;

  const { data } = useBusinessUnit(id || "");

  const createMutation = useCreateBusinessUnit();
  const updateMutation = useUpdateBusinessUnit();

  useEffect(() => {
    if (isEdit && data?.data) {
      form.setFieldsValue({
        name: data.data.name,
        isActive: data.data.isActive,
      });
    }
  }, [data, form, isEdit]);

  const onFinish = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id,
          payload: values,
        });

        message.success(
          "Business Unit updated successfully"
        );
      } else {
        await createMutation.mutateAsync(values);

        message.success(
          "Business Unit created successfully"
        );
      }

      navigate("/business-units");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 1300,
        margin: "0 auto",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Card
          style={{ marginBottom: 24 }}
          bodyStyle={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            {isEdit
              ? "Edit Business Unit"
              : "Add Business Unit"}
          </Title>

          <Space>
            <Button
              onClick={() =>
                navigate("/business-units")
              }
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              Save
            </Button>
          </Space>
        </Card>

        <Row gutter={24} align="top">
          <Col xs={24} lg={12}>
            <Card
              title="Business Unit Details"
              style={{ height: "100%" }}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message:
                      "Business Unit Name is required",
                  },
                ]}
              >
                <Input placeholder="Business Unit Name" />
              </Form.Item>

              {isEdit && (
                <Form.Item
                  label="Status"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              )}
            </Card>
          </Col>

          {!isEdit && (
            <Col xs={24} lg={12}>
              <Card
                title="Contact Person Credentials"
                style={{ marginBottom: 24 }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Username"
                      name={[
                        "admin",
                        "username",
                      ]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Password"
                      name={[
                        "admin",
                        "password",
                      ]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="Contact Person Details">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Full Name"
                      name={[
                        "admin",
                        "name",
                      ]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name={[
                        "admin",
                        "email",
                      ]}
                      rules={[
                        {
                          required: true,
                          type: "email",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
}