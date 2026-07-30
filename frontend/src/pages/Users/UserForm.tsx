import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Select,
  message,
  Spin,
} from "antd";

import {
  useCreateUser,
  useUpdateUser,
  useUser,
} from "../../hooks/useUsers";

import { useRoles } from "../../hooks/useRoles";
import FileUpload from "../../components/common/FileUpload";
import api from "../../services/api";

const { Title } = Typography;

export default function UserForm() {
  const navigate = useNavigate();

  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [roleIds, setRoleIds] = useState<number[]>([]);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const { data, isLoading } = useUser(
    isEdit ? Number(id) : undefined,
  );

  const { data: rolesData } = useRoles({
    page: 1,
    limit: 100,
  });

  const { data: userRolesData } = useQuery({
    queryKey: ["user-roles", id],
    queryFn: async () => {
      const response = await api.get(
        `/api/users/${id}/roles`,
      );
      return response.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && data?.data) {
      form.setFieldsValue({
        name: data.data.name,
        email: data.data.email,
        username: data.data.username,
      });

      setAvatarUrl(data.data.profilePicture);
    }
  }, [data, form, isEdit]);

  useEffect(() => {
    if (isEdit && userRolesData?.data) {
      setRoleIds(
        userRolesData.data.map((r: any) => r.id),
      );
    }
  }, [userRolesData, isEdit]);

  const onFinish = async (values: any) => {
    if (
      values.password &&
      values.password !== values.confirmPassword
    ) {
      message.error("Passwords do not match");
      return;
    }

    try {
      const payload: any = {
        name: values.name,
        username: values.username,
        email: values.email,
        profilePicture: avatarUrl,
        roleIds,
      };

      if (values.password) {
        payload.password = values.password;
      }

      if (isEdit) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: payload,
        });

        message.success("User updated successfully");
      } else {
        await createMutation.mutateAsync(payload);

        message.success("User created successfully");
      }

      navigate("/users");
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

  const roleOptions =
    rolesData?.data?.map((r: any) => ({
      label: r.name,
      value: r.id,
    })) || [];

  return (
    <>
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? "Edit User" : "Add User"}
          </Title>

          <Space>
            <Button onClick={() => navigate("/users")}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              form="user-form"
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
        id="user-form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title="User Details">
              <Form.Item
                name="name"
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

              <Form.Item label="Profile Picture">
                <FileUpload
                  type="image"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  label="Upload Profile Picture"
                />
              </Form.Item>

              <Form.Item
                name="email"
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

          <Col xs={24} lg={12}>
            <Card
              title="Credentials"
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
                <Input placeholder="e.g. sara.staff" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {
                        required: !isEdit,
                        message: "Please enter password",
                      },
                      {
                        min: 6,
                        message: "Minimum 6 characters",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Password" />
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

            <Card title="Assign Roles">
              <Form.Item label="Select Roles">
                <Select
                  mode="multiple"
                  placeholder="Roles"
                  value={roleIds}
                  onChange={setRoleIds}
                  options={roleOptions}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}