import api from "./api";
import type {
  CreateExpensePayload,
  UpdateExpensePayload,
} from "../types/expense";

export const getExpenses = async (params?: any) => {
  const response = await api.get("/api/expenses", {
    params,
  });

  return response.data;
};

export const getExpense = async (id: number) => {
  const response = await api.get(`/api/expenses/${id}`);

  return response.data;
};

export const createExpense = async (
  data: CreateExpensePayload,
) => {
  const response = await api.post(
    "/api/expenses",
    data,
  );

  return response.data;
};

export const updateExpense = async (
  id: number,
  data: UpdateExpensePayload,
) => {
  const response = await api.put(
    `/api/expenses/${id}`,
    data,
  );

  return response.data;
};

export const deleteExpense = async (id: number) => {
  const response = await api.delete(
    `/api/expenses/${id}`,
  );

  return response.data;
};

export const approveExpense = async (id: number) => {
  const response = await api.post(
    `/api/expenses/${id}/approve`,
  );

  return response.data;
};

export const rejectExpense = async (id: number) => {
  const response = await api.post(
    `/api/expenses/${id}/reject`,
  );

  return response.data;
};