import { useEffect } from "react";

import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
  Spin,
} from "antd";

import {
  useMyProfile,
  useUpdateMyProfile,
} from "../../hooks/useProfile";

import FileUpload from "../../components/common/FileUpload";
import { getUser, saveUser } from "../../utils/auth";

const { Title } = Typography;

export default function Profile() {
  const [form] = Form.useForm();

  const { data, isLoading } = useMyProfile();
  const updateMutation = useUpdateMyProfile();

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue({
        name: data.data.name,
        username: data.data.username,
        email: data.data.email,
        profilePicture: data.data.profilePicture,
      });
    }
  }, [data, form]);

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
        email: values.email,
        profilePicture: values.profilePicture ?? null,
      };

      if (values.password) {
        payload.password = values.password;
      }

      const response = await updateMutation.mutateAsync(
        payload,
      );

      // Keep the locally cached user in sync so the header avatar,
      // name, etc. reflect the change immediately.
      const currentUser = getUser();

      saveUser({
        ...currentUser,
        name: response.data.name,
        email: response.data.email,
        profilePicture: response.data.profilePicture,
      });

      message.success("Profile updated successfully");

      // No global state store for the logged-in user yet — reloading
      // is the simplest way to guarantee the header picks up the change.
      window.location.reload();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Failed to update profile",
      );
    }
  };

  if (isLoading) {
    return <Spin fullscreen />;
  }

  return (
    <>
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Title level={3} style={{ margin: 0 }}>
            Edit Profile
          </Title>

          <Button
            type="primary"
            htmlType="submit"
            form="profile-form"
            loading={updateMutation.isPending}
          >
            Save
          </Button>
        </Row>
      </Card>

      <Form
        id="profile-form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title="Profile Details">
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

              <Form.Item
                name="profilePicture"
                label="Profile Picture"
              >
                <FileUpload
                  type="image"
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
            <Card title="Account">
              <Form.Item
                name="username"
                label="Username"
              >
                <Input disabled />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="New Password"
                    rules={[
                      {
                        min: 6,
                        message: "Minimum 6 characters",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Leave blank to keep current password" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                  >
                    <Input.Password placeholder="Confirm New Password" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}