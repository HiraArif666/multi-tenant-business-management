import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function Dashboard() {
  return (
    <>
      <Title level={2}>Dashboard</Title>

      <Paragraph>
        Welcome to the Multi-Tenant Business Management System.
      </Paragraph>
    </>
  );
}