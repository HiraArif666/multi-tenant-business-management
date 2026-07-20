import { Button, Card, Form, Input, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { login } from "../../api/auth";
import { saveToken, saveUser } from "../../utils/auth";

const { Title, Text } = Typography;

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);

      const response = await login(data);

      saveToken(response.token);
      saveUser(response.user);

      message.success("Login successful");

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          "Login failed"
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
        <Title
          level={2}
          style={{
            textAlign: "center",
          }}
        >
          Multi-Tenant BM
        </Title>

        <Text
          type="secondary"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Sign in to continue
        </Text>

        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
        >
          <Form.Item
            label="Username"
            validateStatus={
              errors.username ? "error" : ""
            }
            help={errors.username?.message}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Username"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            validateStatus={
              errors.password ? "error" : ""
            }
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              )}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}