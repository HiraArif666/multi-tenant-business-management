import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Empty,
  Spin,
  List,
  Tag,
  message,
} from "antd";
import {
  BellOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { notificationApi } from "../../api/notification.api";

interface Notification {
  id: number;
  businessUnitId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

const typeColors: Record<string, string> = {
  expense_approved: "green",
  expense_pending: "orange",
  report_generated: "blue",
  user_added: "purple",
};

const typeIcons: Record<string, string> = {
  expense_approved: "✓",
  expense_pending: "⏳",
  report_generated: "📊",
  user_added: "👤",
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);

const fetchUnreadCount = async () => {
  try {
const response = await notificationApi.getUnreadCount();

console.log("UNREAD COUNT:", response);

setUnreadCount(response.data?.unreadCount ?? 0);
    console.log("Unread count response:", response);

    const count =
      typeof response === "number"
        ? response
        : response.data?.unreadCount ?? response.data ?? 0;

    setUnreadCount(count);
  } catch (error) {
    console.error("Failed to fetch unread count", error);
  }
};

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications(pageNum, 10);
      setNotifications(response.data);
      setTotal(response.total);
      setUnreadCount(response.unreadCount);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      message.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    setOpen(!open);
    if (!open) {
      fetchNotifications(1);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
      message.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
      message.success("All marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      message.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (
    notificationId: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId),
      );
      setTotal((prev) => prev - 1);
      message.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification", error);
      message.error("Failed to delete notification");
    }
  };

  const handleLoadMore = () => {
    fetchNotifications(page + 1);
  };

  const dropdownContent = (
    <div style={{ width: 420, background: "#fff", borderRadius: "4px" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            style={{ fontSize: "12px" }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      {loading && notifications.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: "40px 20px" }}>
          <Empty description="No notifications" />
        </div>
      ) : (
        <>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            <List
              dataSource={notifications}
              renderItem={(notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  style={{
                    backgroundColor: !notification.isRead
                      ? "#f6f8fb"
                      : "transparent",
                    cursor: "pointer",
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fafafa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = !notification.isRead
                      ? "#f6f8fb"
                      : "transparent";
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>
                        {typeIcons[
                          notification.type as keyof typeof typeIcons
                        ] || "•"}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "#1890ff",
                            borderRadius: "50%",
                            marginLeft: "auto",
                          }}
                        />
                      )}
                    </div>
                    <Tag
                      color={
                        typeColors[
                          notification.type as keyof typeof typeColors
                        ] || "default"
                      }
                      style={{ marginBottom: "4px", fontSize: "11px" }}
                    >
                      {notification.type.replace(/_/g, " ")}
                    </Tag>
                    <p
                      style={{
                        margin: "4px 0",
                        fontSize: "12px",
                        color: "#666",
                        lineHeight: "1.4",
                      }}
                    >
                      {notification.message}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "#999",
                      }}
                    >
                      {formatTime(new Date(notification.createdAt))}
                    </p>
                  </div>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    style={{ minWidth: "32px" }}
                  />
                </div>
              )}
            />
          </div>

          {notifications.length < total && (
            <div style={{ padding: "12px 16px", textAlign: "center" }}>
              <Button
                type="link"
                onClick={handleLoadMore}
                loading={loading}
                size="small"
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          onClick={handleBellClick}
          style={{ padding: "4px 8px" }}
        />
      </Badge>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              zIndex: 1000,
              boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {dropdownContent}
          </div>
        </>
      )}
    </div>
  );
};