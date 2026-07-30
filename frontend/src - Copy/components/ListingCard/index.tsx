import {
  Card,
  Avatar,
  Space,
  Button,
  Tooltip,
  Tag,
} from "antd";

import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

interface ListingCardProps {
  id: number;
  name: string;
  isActive: boolean;

  onSelect?: (id: number) => void;
  onEdit?: (id: number) => void;
  onToggleStatus?: (id: number) => void;
}

export default function ListingCard({
  id,
  name,
  isActive,
  onSelect,
  onEdit,
  onToggleStatus,
}: ListingCardProps) {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        height: "100%",
      }}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <Space
        direction="vertical"
        size={20}
        style={{
          width: "100%",
        }}
      >
        {/* Header */}

        <Space
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Space>
            <Avatar
              size={48}
              style={{
                background: "#1677ff",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                {name}
              </div>

              <Tag
                color={isActive ? "green" : "red"}
                style={{
                  marginTop: 6,
                }}
              >
                {isActive
                  ? "Active"
                  : "Inactive"}
              </Tag>
            </div>
          </Space>
        </Space>

        {/* Actions */}

        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Tooltip title="Select">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => onSelect?.(id)}
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit?.(id)}
            />
          </Tooltip>

          <Tooltip
            title={
              isActive
                ? "Deactivate"
                : "Activate"
            }
          >
            <Button
              danger={isActive}
              icon={
                isActive ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )
              }
              onClick={() =>onToggleStatus?.(id)
              }
            />
          </Tooltip>
        </Space>
      </Space>
    </Card>
  );
}