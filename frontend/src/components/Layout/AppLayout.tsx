import { Layout, Menu, Button, Typography } from "antd";
import {
  DashboardOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  BankOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { logout, getUser } from "../../utils/auth";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUser();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/business-units",
      icon: <ApartmentOutlined />,
      label: "Business Units",
    },
    {
      key: "/company-types",
      icon: <AppstoreOutlined />,
      label: "Company Types",
    },
    {
      key: "/companies",
      icon: <BankOutlined />,
      label: "Companies",
    },
    {
      key: "/users",
      icon: <TeamOutlined />,
      label: "Users",
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark">
        <div
          style={{
            color: "#fff",
            textAlign: "center",
            padding: 20,
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Multi-Tenant BM
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 24,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Business Management
          </Title>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div>
              <Text strong>{user?.name}</Text>

              <br />

              <Text type="secondary">{user?.role}</Text>
            </div>

            <Button
              icon={<LogoutOutlined />}
              danger
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 10,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}