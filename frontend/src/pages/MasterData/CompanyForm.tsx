import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Switch,
  message,
  Spin,
} from "antd";

import {
  useCompany,
  useCreateCompany,
  useUpdateCompany,
} from "../../hooks/useCompanies";

import FileUpload from "../../components/common/FileUpload";
import { MASTER_DATA_CONFIG } from "../../constants/masterData";

const { Title } = Typography;

export default function CompanyForm() {
  const navigate = useNavigate();

  const { type, id } = useParams();
  const config = type ? MASTER_DATA_CONFIG[type] : undefined;
  const isEdit = !!id;

  const [form] = Form.useForm();

  const { data, isLoading } = useCompany(
    config?.basePath ?? "",
    isEdit ? Number(id) : undefined,
  );

  const createMutation = useCreateCompany(
    config?.basePath ?? "",
  );

  const updateMutation = useUpdateCompany(
    config?.basePath ?? "",
  );

  useEffect(() => {
    if (data?.data) {
form.setFieldsValue({
    name: data.data.name,
    email: data.data.email,
    phone: data.data.phone,
    address: data.data.address,
    website: data.data.website,
    logo: data.data.logo,
    isActive: data.data.isActive,

    username: data.data.admin?.username,
    contactName: data.data.admin?.name,
    contactEmail: data.data.admin?.email,
});
    }
  }, [data, form, isEdit]);

  if (!config) {
    return <Card>Unknown Master Data type.</Card>;
  }

  const onFinish = async (values: any) => {
    if (
      !isEdit &&
      values.password !== values.confirmPassword
    ) {
      message.error("Passwords do not match");
      return;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: {
            name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            website: values.website,
            logo: values.logo ?? null,
            isActive: values.isActive,
            admin: {
            username: values.username,
            password: values.password,
            name: values.contactName,
            email: values.contactEmail,
          },
          },
        });

        message.success(
          `${config.label} updated successfully`,
        );
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          website: values.website,
          logo: values.logo ?? null,

          admin: {
            username: values.username,
            password: values.password,
            name: values.contactName,
            email: values.contactEmail,
          },
        });

        message.success(
          `${config.label} created successfully`,
        );
      }

      navigate(`/master-data/${type}`);
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
            {isEdit
              ? `Edit ${config.label}`
              : `Add ${config.label}`}
          </Title>

          <Space>
            <Button
              onClick={() =>
                navigate(`/master-data/${type}`)
              }
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              form="company-form"
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

      <Form
        id="company-form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title={`${config.label} Details`}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter name",
                  },
                ]}
              >
                <Input
                  placeholder={`e.g. ${config.label} 1`}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input placeholder="e.g. contact@example.com" />
              </Form.Item>

              <Form.Item name="phone" label="Phone">
                <Input placeholder="e.g. 1234567890" />
              </Form.Item>

              <Form.Item name="address" label="Address">
                <Input placeholder="e.g. Street, City" />
              </Form.Item>

              <Form.Item name="website" label="Website">
                <Input placeholder="e.g. https://example.com" />
              </Form.Item>

              <Form.Item name="logo" label="Logo">
                <FileUpload
                  type="image"
                  label="Upload Logo"
                />
              </Form.Item>

              {isEdit && (
                <Form.Item
                  name="isActive"
                  label="Active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
              <Card
                title="Contact Person Credentials"
                style={{ marginBottom: 24 }}
              >
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    {
                      required: true,
                      message: "Please enter username",
                    },
                  ]}
                >
                  <Input placeholder="e.g. contact.person" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
  name="password"
  label="Password"
  rules={
    isEdit
      ? [
          {
            min: 6,
            message: "Minimum 6 characters",
          },
        ]
      : [
          {
            required: true,
            message: "Please enter password",
          },
          {
            min: 6,
            message: "Minimum 6 characters",
          },
        ]
  }
>
  <Input.Password
    placeholder={
      isEdit
        ? "Leave blank to keep current password"
        : "Password"
    }
  />
</Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                    >
                      <Input.Password placeholder="Confirm Password" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="Contact Person Details">
                <Form.Item
                  name="contactName"
                  label="Full Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter full name",
                    },
                  ]}
                >
                  <Input placeholder="e.g. Sara Khan" />
                </Form.Item>

                <Form.Item
                  name="contactEmail"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter email",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email",
                    },
                  ]}
                >
                  <Input placeholder="e.g. sara@example.com" />
                </Form.Item>
              </Card>
            </Col>
          
        </Row>
      </Form>
    </>
  );
}