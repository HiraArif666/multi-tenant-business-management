import { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
  Result,
} from "antd";

import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../api/auth";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values: {
    email: string;
  }) => {
    try {
      setLoading(true);

      await forgotPassword(values.email);

      setSubmitted(true);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Something went wrong",
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
        {submitted ? (
          <Result
            status="success"
            title="Check your email"
            subTitle="If an account exists for that email, a password reset link has been sent. The link expires in 1 hour."
            extra={
              <Link to="/">Back to Login</Link>
            }
          />
        ) : (
          <>
            <Title
              level={3}
              style={{ textAlign: "center" }}
            >
              Forgot Password
            </Title>

            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              Enter your email and we'll send you a
              reset link.
            </Text>

            <Form
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="you@example.com"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Send Reset Link
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