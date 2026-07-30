import api from "../services/api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "../types/user";

export const getUsers = async (params?: any) => {
  const response = await api.get("/api/users", {
    params,
  });

  return response.data;
};

export const getUser = async (id: number) => {
  const response = await api.get(`/api/users/${id}`);

  return response.data;
};

export const createUser = async (
  data: CreateUserPayload,
) => {
  const response = await api.post("/api/users", data);

  return response.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserPayload,
) => {
  const response = await api.put(
    `/api/users/${id}`,
    data,
  );

  return response.data;
};

export const updateUserStatus = async (
  id: number,
  isActive: boolean,
) => {
  const response = await api.put(`/api/users/${id}`, {
    isActive,
  });

  return response.data;
};

export const deleteUser = async (
  id: number | string,
) => {
  const response = await api.delete(`/api/users/${id}`);

  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/api/users/me");

  return response.data;
};

export const updateMyProfile = async (data: {
  name?: string;
  email?: string;
  profilePicture?: string | null;
  password?: string;
}) => {
  const response = await api.put("/api/users/me", data);

  return response.data;
};