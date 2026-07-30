import { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Space,
} from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { logout, getUser } from "../../utils/auth";
import { getSelectedBusinessUnit } from "../../utils/businessUnit";
import { hasPermission } from "../../utils/permissions";
import type { MenuProps } from "antd";
import type { ItemType } from "antd/es/menu/interface";
const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const user = getUser();

  const selectedBusinessUnit =
    getSelectedBusinessUnit();

  const businessUnitSelected =
    !!selectedBusinessUnit;

  const isSuperAdmin =
    user?.role === "superadmin";

  const handleLogout = () => {
    logout();
    navigate("/", {
      replace: true,
    });
  };

  const getOpenKeys = () => {
    if (
      location.pathname.startsWith("/users") ||
      location.pathname.startsWith("/roles")
    ) {
      return ["staff"];
    }

    return [];
  };

  // ==========================
  // Sidebar Menu
  // ==========================

const menuItems: ItemType[] = (isSuperAdmin && !businessUnitSelected)
  ? []
  : [
      hasPermission("dashboard.view") && {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },

      (hasPermission("staff.users.view") || hasPermission("staff.roles.view")) && {
        key: "staff",
        icon: <TeamOutlined />,
        label: "Staff",

        children: (
          [
            hasPermission("staff.users.view") && {
              key: "/users",
              icon: <UserOutlined />,
              label: "Users",
            },

            hasPermission("staff.roles.view") && {
              key: "/roles",
              icon: <AppstoreOutlined />,
              label: "Roles",
            },
          ].filter(Boolean) as ItemType[]
        ),
      },
    ].filter(Boolean) as ItemType[];

  // ==========================
  // User Dropdown
  // ==========================

const dropdownItems: MenuProps["items"] = [
  {
    key: "userinfo",
    disabled: true,
    label: (
      <div style={{ minWidth: 220 }}>
        <Text strong>{user?.name}</Text>
        <br />
        <Text type="secondary">{user?.email}</Text>
      </div>
    ),
  },

  {
    type: "divider",
  },

  ...(!isSuperAdmin
    ? [
        {
          key: "profile",
          icon: <EditOutlined />,
          label: "Edit Profile",
          onClick: () => navigate("/profile"),
        },
      ]
    : []),

  {
    key: "logout",
    icon: <LogoutOutlined />,
    danger: true,
    label: "Logout",
    onClick: handleLogout,
  },
];

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        theme="dark"
        width={260}
        collapsible
        collapsed={collapsed}
        trigger={null}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: collapsed
              ? 18
              : 20,
            fontWeight: "bold",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >
          {collapsed
            ? "MB"
            : "MultiTenantBM"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[
            location.pathname,
          ]}
          defaultOpenKeys={
            getOpenKeys()
          }
          items={menuItems}
          onClick={({ key }) => {
            if (
              key.startsWith("/")
            ) {
                  console.log("Clicked:", key);
              navigate(key);
            }
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            paddingInline: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{
                  fontSize: 22,
                  cursor: "pointer",
                }}
                onClick={() =>
                  setCollapsed(
                    false,
                  )
                }
              />
            ) : (
              <MenuFoldOutlined
                style={{
                  fontSize: 22,
                  cursor: "pointer",
                }}
                onClick={() =>
                  setCollapsed(
                    true,
                  )
                }
              />
            )}

            <Title
              level={4}
              style={{
                margin: 0,
              }}
            >
              {businessUnitSelected
                ? selectedBusinessUnit?.name
                : isSuperAdmin
                ? "Select Business Unit"
                : "Dashboard"}
            </Title>
          </div>

          <Dropdown
            menu={{
              items:
                dropdownItems,
            }}
            trigger={[
              "click",
            ]}
            placement="bottomRight"
          >
            <Space
              style={{
                cursor: "pointer",
              }}
            >
              <Avatar
                size={40}
                icon={
                  <UserOutlined />
                }
              />

              {!collapsed && (
                <Text strong>
                  {user?.name}
                </Text>
              )}
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 10,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}