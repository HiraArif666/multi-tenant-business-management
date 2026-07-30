import api from "../services/api";
import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth";

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response =
    await api.post<LoginResponse>(
      "/api/auth/login",
      data
    );

  return response.data;
};

export const logout = async () => {
  await api.post("api//auth/logout");
};