import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
  baseURL: `${API_URL}/notifications`,
  withCredentials: true,
});

// ✅ ADD JWT TOKEN TO EVERY REQUEST
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');  // ✅ Use this
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

interface NotificationsResponse {
  success: boolean;
  data: any[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

interface GenericResponse {
  success: boolean;
  message: string;
  data?: any;
}

const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get("/unread-count");
  return response.data;
};

const getNotifications = async (
  page: number = 1,
  limit: number = 10,
): Promise<NotificationsResponse> => {
  const response = await apiClient.get("/", {
    params: { page, limit },
  });
  return response.data;
};

const markAsRead = async (notificationId: number): Promise<GenericResponse> => {
  const response = await apiClient.patch(`/${notificationId}/read`);
  return response.data;
};

const markAllAsRead = async (): Promise<GenericResponse> => {
  const response = await apiClient.patch("/mark-all/read");
  return response.data;
};

const deleteNotification = async (
  notificationId: number,
): Promise<GenericResponse> => {
  const response = await apiClient.delete(`/${notificationId}`);
  return response.data;
};

const deleteAllNotifications = async (): Promise<GenericResponse> => {
  const response = await apiClient.delete("/");
  return response.data;
};

export const notificationApi = {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};