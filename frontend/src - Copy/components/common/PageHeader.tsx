import { Button, Flex, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  onAdd?: () => void;
}

export default function PageHeader({
  title,
  buttonText = "Add New",
  onAdd,
}: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ marginBottom: 24 }}
    >
      <Title level={3} style={{ margin: 0 }}>
        {title}
      </Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAdd}
      >
        {buttonText}
      </Button>
    </Flex>
  );
}