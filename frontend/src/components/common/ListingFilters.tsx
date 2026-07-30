import { Button, Col, Form, Input, Row, Select } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

interface Props {
  onSearch: (values: any) => void;
  onClear: () => void;
}

export default function ListingFilters({
  onSearch,
  onClear,
}: Props) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.setFieldsValue({
      search: "",
      status: true,
    });

    onClear();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        search: "",
        status: true,
      }}
      onFinish={onSearch}
    >
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Search"
            name="search"
          >
            <Input
              allowClear
              placeholder="Search by Name"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={6}>
          <Form.Item
            label="Status"
            name="status"
          >
            <Select
              options={[
                {
                  label: "Active",
                  value: true,
                },
                {
                  label: "Inactive",
                  value: false,
                },
              ]}
            />
          </Form.Item>
        </Col>

        <Col
          xs={24}
          md={10}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
          >
            Search
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );
}