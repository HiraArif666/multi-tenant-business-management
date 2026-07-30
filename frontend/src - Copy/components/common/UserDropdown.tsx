import { Avatar, Dropdown, Space, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

import { getUser, logout } from "../../utils/auth";

const { Text } = Typography;

export default function UserDropdown() {
  const navigate = useNavigate();

  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const items: MenuProps["items"] = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <Space direction="vertical" size={0}>
          <Text strong>{user?.name ?? "User"}</Text>

          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email ?? ""}
          </Text>
        </Space>
      ),
    },

    {
      type: "divider",
    },

    {
      key: "profile",
      icon: <EditOutlined />,
      label: "Edit Profile",
      onClick: () => navigate("/profile"),
    },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <Space
        style={{
          cursor: "pointer",
        }}
      >
        <Avatar
          size={38}
          icon={<UserOutlined />}
        />

        <Text strong>
          {user?.name ?? "User"}
        </Text>
      </Space>
    </Dropdown>
  );
}