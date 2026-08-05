import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
  Result,
  Alert,
} from "antd";

import { LockOutlined } from "@ant-design/icons";

import { resetPassword } from "../../api/auth";

const { Title, Text } = Typography;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    if (!token) {
      message.error("This reset link is invalid");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, values.password);

      setDone(true);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "This reset link is invalid or has expired",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 10,
        }}
      >
        {done ? (
          <Result
            status="success"
            title="Password reset successfully"
            subTitle="You can now log in with your new password."
            extra={
              <Button
                type="primary"
                onClick={() =>
                  navigate("/", { replace: true })
                }
              >
                Go to Login
              </Button>
            }
          />
        ) : (
          <>
            <Title
              level={3}
              style={{ textAlign: "center" }}
            >
              Reset Password
            </Title>

            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              Choose a new password for your account.
            </Text>

            {!token && (
              <Alert
                style={{ marginBottom: 20 }}
                type="error"
                showIcon
                message="This reset link is missing its token. Please use the link from your email."
              />
            )}

            <Form
              layout="vertical"
              onFinish={onFinish}
              disabled={!token}
            >
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter a new password",
                  },
                  {
                    min: 6,
                    message: "Minimum 6 characters",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New Password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Reset Password
              </Button>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                <Link to="/">Back to Login</Link>
              </div>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}