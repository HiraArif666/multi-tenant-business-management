import {
  Card,
  Row,
  Col,
  Space,
  Button,
  Popconfirm,
  Tag,
} from "antd";
import {
  ApartmentOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface Props {
  data: any[];
  activeView: boolean;
  editPath: string;
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
}

export default function CardGrid({
  data,
  activeView,
  editPath,
  onDelete,
  onSelect,
}: Props) {
  const navigate = useNavigate();

  return (
    <Row gutter={[24, 24]}>
      {data.map((item: any) => (
        <Col
          xs={24}
          sm={12}
          md={8}
          lg={6}
          xl={6}
          key={item.id}
        >
          <Card
            hoverable
            style={{
              borderRadius: 18,
              overflow: "hidden",
              boxShadow:
                "0 3px 10px rgba(0,0,0,.08)",
              transition: "all .25s",
            }}
            bodyStyle={{
              padding: 0,
            }}
          >
            {/* Body */}
            <div
              style={{
                padding: 28,
                textAlign: "center",
                minHeight: 170,
              }}
            >
              <ApartmentOutlined
                style={{
                  fontSize: 54,
                  color: "#1677ff",
                }}
              />

              <div
                style={{
                  marginTop: 22,
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  marginTop: 12,
                }}
              >
                {item.isActive ? (
                  <Tag color="success">
                    Active
                  </Tag>
                ) : (
                  <Tag color="default">
                    Inactive
                  </Tag>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop:
                  "1px solid #f0f0f0",
                padding: 14,
                display: "flex",
                justifyContent:
                  "space-evenly",
              }}
            >
              <Button
                type="text"
                icon={
                  <CheckCircleFilled
                    style={{
                      color: "#52c41a",
                    }}
                  />
                }
                onClick={() =>
                  onSelect(item.id)
                }
              />

              {activeView && (
                <>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() =>
                      navigate(
                        `${editPath}/${item.id}`
                      )
                    }
                  />

                  <Popconfirm
                    title="Delete Business Unit?"
                    onConfirm={() =>
                      onDelete(item.id)
                    }
                  >
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}