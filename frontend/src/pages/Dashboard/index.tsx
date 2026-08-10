import { Card, Col, Row, List, Typography, Statistic, Space } from 'antd';
import { useDashboard } from '../../hooks/useDashboard';
import { hasPermission } from '../../utils/permissions';

const { Title } = Typography;

function MiniBar({ data }: { data: Array<{ label: string; total: number }> }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'end', height: 80, padding: '8px 4px' }}>
      {data.map((d) => (
        <div key={d.label} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 24,
              height: `${(d.total / max) * 100}%`,
              background: 'linear-gradient(180deg,#40a9ff,#08306b)',
              borderRadius: 6,
              boxShadow: '0 6px 12px rgba(16,39,112,0.08)'
            }}
          />
          <div style={{ fontSize: 11, marginTop: 6 }}>{d.label.split(' ')[0]}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  const overview = data?.data;

  const showExpensesMonth = hasPermission('dashboard.expenses-month.view');
  const showPending = hasPermission('dashboard.pending-approvals.view');
  const showTop = hasPermission('dashboard.top-expense-categories.view');
  const showChart = hasPermission('dashboard.monthly-expense-chart.view');
  const showRecent = hasPermission('dashboard.recent-activity.view');

  const pageStyle: React.CSSProperties = {
    padding: 24,
    background: '#f5f7fa',
    minHeight: '100vh',
  };

  const cardStyle: React.CSSProperties = {
    boxShadow: '0 10px 30px rgba(16,39,112,0.12)',
    borderRadius: 10,
    overflow: 'hidden',
    border: 'none',
  };

  const titleStyle: React.CSSProperties = {
    marginBottom: 16,
    padding: '12px 0 8px',
  };

  const cardHeadStyle: React.CSSProperties = {
    padding: '18px 24px',
    fontWeight: 600,
  };

  return (
    <div style={pageStyle}>
      <Title level={2} style={titleStyle}>
        Dashboard
      </Title>

      <Row gutter={20} style={{ marginBottom: 16 }}>
        {showExpensesMonth && (
          <Col xs={24} sm={12} md={6}>
            <Card style={cardStyle} bodyStyle={{ padding: 18 }}>
              <Statistic
                title="Expenses This Month"
                value={overview?.expensesMonth ?? 0}
                precision={2}
                prefix="Rs."
              />
            </Card>
          </Col>
        )}

        {showPending && (
          <Col xs={24} sm={12} md={6}>
            <Card style={cardStyle} bodyStyle={{ padding: 18 }}>
              <Statistic
                title="Pending Approvals"
                value={overview?.pendingApprovals ?? 0}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          {showChart && (
            <Card
              title="Monthly Expense Chart"
              headStyle={cardHeadStyle}
              style={{ ...cardStyle, minHeight: 240 }}
              bodyStyle={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ width: '100%' }}>
                <MiniBar data={overview?.monthlyChart || []} />
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={12}>
          {showTop && (
            <Card
              title="Top Expense Items"
              headStyle={cardHeadStyle}
              style={{ ...cardStyle, minHeight: 240 }}
              bodyStyle={{ padding: 12 }}
            >
              <List
                dataSource={overview?.topItems || []}
                renderItem={(item: any) => (
                  <List.Item style={{ padding: '8px 12px' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>{item.title}</span>
                      <strong>Rs. {Number(item.total).toLocaleString()}</strong>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>

      {showRecent && (
        <Card title="Recent Activity" headStyle={cardHeadStyle} style={cardStyle} bodyStyle={{ padding: 12 }}>
          <List
            loading={isLoading}
            dataSource={overview?.recentActivity || []}
            renderItem={(it: any) => (
              <List.Item style={{ padding: 12 }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{it.userName ?? 'System'}</strong> &nbsp;•&nbsp; {it.module}
                    </div>
                    <div style={{ color: '#888' }}>{new Date(it.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: 6 }}>{it.action}</div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}