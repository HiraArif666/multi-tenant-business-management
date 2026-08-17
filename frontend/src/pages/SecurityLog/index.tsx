import { useState } from 'react';
import {
  Card,
  Typography,
  Table,
  Select,
  Input,
  DatePicker,
  Tag,
  Button,
  Modal,
  Row,
  Col,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSecurityLogs } from '../../hooks/useSecurityLogs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const EVENT_COLORS: Record<string, string> = {
  login_success: 'green',
  login_failed: 'volcano',
  logout: 'blue',
  account_locked: 'red',
  password_changed: 'purple',
  password_reset: 'cyan',
  suspicious_activity: 'orange',
};

export default function SecurityLog() {
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const { data, isLoading } = useSecurityLogs(filters);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      render: (value: string) =>
        dayjs(value).format('DD-MMM-YYYY hh:mm A'),
    },
    {
      title: 'Event',
      dataIndex: 'eventType',
      render: (value: string) => (
        <Tag color={EVENT_COLORS[value] || 'default'}>
          {value.toUpperCase()}
        </Tag>
      ),
    },
    { title: 'User', dataIndex: 'username' },
    { title: 'IP Address', dataIndex: 'ipAddress' },
    { title: 'Browser / Device', dataIndex: 'userAgent' },
    {
      title: '',
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedLog(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Security Logs
      </Title>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            allowClear
            placeholder="Event"
            style={{ width: 220 }}
            options={Object.keys(EVENT_COLORS).map((event) => ({
              label: event.replace('_', ' '),
              value: event,
            }))}
            onChange={(value) =>
              setFilters((prev: any) => ({
                ...prev,
                eventType: value,
                page: 1,
              }))
            }
          />
        </Col>
        <Col>
          <Input.Search
            allowClear
            placeholder="Search by username"
            style={{ width: 220 }}
            onSearch={(value) =>
              setFilters((prev: any) => ({
                ...prev,
                username: value || undefined,
                page: 1,
              }))
            }
          />
        </Col>
        <Col>
          <RangePicker
            onChange={(dates) =>
              setFilters((prev: any) => ({
                ...prev,
                dateFrom: dates?.[0]
                  ? dates[0].startOf('day').toISOString()
                  : undefined,
                dateTo: dates?.[1]
                  ? dates[1].endOf('day').toISOString()
                  : undefined,
                page: 1,
              }))
            }
          />
        </Col>
      </Row>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
        scroll={{ x: true }}
        pagination={{
          current: filters.page,
          total: data?.total,
          pageSize: filters.limit,
          onChange: (page) =>
            setFilters((prev: any) => ({
              ...prev,
              page,
            })),
        }}
      />

      <Modal
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        title="Security Log Details"
        width={800}
      >
        {selectedLog && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text type="secondary">Event</Text>
                <div>{selectedLog.eventType}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Timestamp</Text>
                <div>
                  {dayjs(selectedLog.createdAt).format(
                    'DD-MMM-YYYY hh:mm A',
                  )}
                </div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text type="secondary">User</Text>
                <div>{selectedLog.username ?? '-'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">IP / Browser</Text>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedLog.ipAddress ?? '-'} / {selectedLog.userAgent ?? '-'}
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Text strong>Details</Text>
                <pre
                  style={{
                    background: '#fafafa',
                    padding: 12,
                    borderRadius: 6,
                    maxHeight: 350,
                    overflow: 'auto',
                    fontSize: 12,
                  }}
                >
                  {selectedLog.details
                    ? JSON.stringify(selectedLog.details, null, 2)
                    : '-'}
                </pre>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Card>
  );
}
