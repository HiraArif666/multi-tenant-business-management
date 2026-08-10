import {
  Card,
  Avatar,
  Badge,
  Tooltip,
  Typography,
} from "antd";

import {
  ApartmentOutlined,
  DashboardOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Props {
  item: any;
  onSelect: (item: any) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function BusinessUnitCard({
  item,
  onSelect,
  onEdit,
}: Props) {
  return (
    <Card
      hoverable
      bodyStyle={{
        padding: 0,
      }}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Card Body */}
      <div
        style={{
          padding: 32,
          textAlign: "center",
        }}
      >
        <Avatar
          size={72}
          icon={<ApartmentOutlined />}
          style={{
            background: "#e6f4ff",
            color: "#1677ff",
            marginBottom: 18,
          }}
        />

        <div>
          <Text
            strong
            style={{
              fontSize: 20,
            }}
          >
            {item.name}
          </Text>
        </div>

        <div
          style={{
            marginTop: 14,
          }}
        >
          <Badge
            status={item.isActive ? "success" : "error"}
            text={item.isActive ? "Active" : "Inactive"}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          padding: 16,
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        {/* Select */}
        <Tooltip title="Select Business Unit">
          <DashboardOutlined
            style={{
              color: "#52c41a",
              fontSize: 20,
              cursor: "pointer",
            }}
            onClick={() => onSelect(item)}
          />
        </Tooltip>

        {/* View */}
        <Tooltip title="View">
          <EyeOutlined
            style={{
              color: "#1677ff",
              fontSize: 20,
              cursor: "pointer",
            }}
          />
        </Tooltip>

        {/* Edit */}
        <Tooltip
          title={
            item.isActive
              ? "Edit Business Unit"
              : "Inactive Business Units cannot be edited"
          }
        >
          <EditOutlined
            onClick={() => {
              if (item.isActive) {
                onEdit(item.id);
              }
            }}
            style={{
              fontSize: 20,
              cursor: item.isActive
                ? "pointer"
                : "not-allowed",
              color: item.isActive
                ? "#faad14"
                : "#bfbfbf",
              opacity: item.isActive ? 1 : 0.5,
            }}
          />
        </Tooltip>
      </div>
    </Card>
  );
}