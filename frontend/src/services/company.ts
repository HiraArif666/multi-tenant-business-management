import api from "./api";
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../types/company";

export const getCompanies = async (
  basePath: string,
  params?: any,
) => {
  const response = await api.get(basePath, {
    params,
  });

  return response.data;
};

export const getCompany = async (
  basePath: string,
  id: number,
) => {
  const response = await api.get(`${basePath}/${id}`);

  return response.data;
};

export const createCompany = async (
  basePath: string,
  data: CreateCompanyPayload,
) => {
  const response = await api.post(basePath, data);

  return response.data;
};

export const updateCompany = async (
  basePath: string,
  id: number,
  data: UpdateCompanyPayload,
) => {
  const response = await api.put(
    `${basePath}/${id}`,
    data,
  );

  return response.data;
};

export const updateCompanyStatus = async (
  basePath: string,
  id: number,
  isActive: boolean,
) => {
  const response = await api.put(`${basePath}/${id}`, {
    isActive,
  });

  return response.data;
};

export const deleteCompany = async (
  basePath: string,
  id: number,
) => {
  const response = await api.delete(`${basePath}/${id}`);

  return response.data;
};