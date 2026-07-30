import api from "./api";

export interface BusinessUnitFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
}

export interface CreateBusinessUnitDto {
  name: string;
  description?: string;

  admin: {
    name: string;
    username: string;
    email: string;
    password: string;
  };
}

export interface UpdateBusinessUnitDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export const getBusinessUnits = async (
  filters: BusinessUnitFilters
) => {
  const { data } = await api.get(
    "/api/business-units",
    {
      params: filters,
    }
  );

  return data;
};

export const getBusinessUnit = async (
  id: number | string
) => {
  const { data } = await api.get(
    `/api/business-units/${id}`
  );

  return data;
};

export const createBusinessUnit = async (
  payload: CreateBusinessUnitDto
) => {
  const { data } = await api.post(
    "/api/business-units",
    payload
  );

  return data;
};

export const updateBusinessUnit = async (
  id: number | string,
  payload: UpdateBusinessUnitDto
) => {
  const { data } = await api.put(
    `/api/business-units/${id}`,
    payload
  );

  return data;
};

export const deleteBusinessUnit = async (
  id: number | string
) => {
  const { data } = await api.delete(
    `/api/business-units/${id}`
  );

  return data;
};

/* ===========================
   NEW
=========================== */

export const selectBusinessUnit = async (
  id: number | string
) => {
  const { data } = await api.post(
    `/api/business-units/${id}/select`
  );

  return data;
};
