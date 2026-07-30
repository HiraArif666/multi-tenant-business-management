import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  message,
  Spin,
} from "antd";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import PermissionTree from "../../components/Roles/PermissionTree";

import {
  useCreateRole,
  useUpdateRole,
  useRole,
} from "../../hooks/useRoles";

const { Title } = Typography;

export default function RoleForm() {
  const navigate = useNavigate();

  const { id } = useParams();
  const isEdit = !!id;

  console.log("Role ID:", id);
  console.log("isEdit:", isEdit);

  const [form] = Form.useForm();

  const [permissionIds, setPermissionIds] =
    useState<number[]>([]);

  const createRoleMutation =
    useCreateRole();

  const updateRoleMutation =
    useUpdateRole();

  const { data, isLoading } =
    useRole(
      isEdit ? Number(id) : undefined,
    );

  useEffect(() => {
    if (
      isEdit &&
      data?.data
    ) {
      form.setFieldsValue({
        name: data.data.name,
        description:
          data.data.description,
      });

      const permissions =
        data.data.rolePermissions?.map(
          (x: any) =>
            x.permissionId,
        ) || [];

      setPermissionIds(
        permissions,
      );
    }
  }, [
    data,
    form,
    isEdit,
  ]);

  const onFinish = async (
    values: any,
  ) => {
    try {
      const payload = {
        name: values.name,
        description:
          values.description,
        permissionIds,
      };

      if (isEdit) {
        await updateRoleMutation.mutateAsync(
          {
            id: Number(id),
            data: payload,
          },
        );

        message.success(
          "Role updated successfully",
        );
      } else {
        await createRoleMutation.mutateAsync(
          payload,
        );

        message.success(
          "Role created successfully",
        );
      }

      navigate("/roles");
    } catch (error: any) {
      message.error(
        error?.response?.data
          ?.message ??
          "Operation failed",
      );
    }
  };

  if (
    isEdit &&
    isLoading
  ) {
    return (
      <Spin
        fullscreen
      />
    );
  }

  return (
    <>
      <Card
        style={{
          marginBottom: 20,
        }}
      >
        <Row
          justify="space-between"
          align="middle"
        >
          <Title
            level={3}
            style={{
              margin: 0,
            }}
          >
            {isEdit
              ? "Edit Role"
              : "Add Role"}
          </Title>

          <Space>
            <Button
              onClick={() =>
                navigate(
                  "/roles",
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              form="role-form"
              loading={
                createRoleMutation.isPending ||
                updateRoleMutation.isPending
              }
            >
              Save
            </Button>
          </Space>
        </Row>
      </Card>

      <Form
        id="role-form"
        form={form}
        layout="vertical"
        onFinish={
          onFinish
        }
      >
        <Card title="Role Details">
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Role Name"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter role name",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Card title="Permissions">
          <PermissionTree
            value={
              permissionIds
            }
            onChange={
              setPermissionIds
            }
          />
        </Card>
      </Form>
    </>
  );
}