import api from "../services/api";

export const getRoles = async (params?: any) => {
  const response = await api.get("/api/roles", {
    params,
  });

  return response.data;
};

export const getRole = async (id: number) => {
  console.log("Fetching role:", id);

  const response = await api.get(`/api/roles/${id}`);

  console.log("Response:", response);

  return response.data;
};

export const createRole = async (data: any) => {
  const response = await api.post("/api/roles", data);

  return response.data;
};

export const updateRole = async (
  id: number,
  data: any,
) => {
  const response = await api.put(
    `/api/roles/${id}`,
    data,
  );

  return response.data;
};

export const deleteRole = async (
  id: number | string,
) => {
  const response = await api.delete(
    `/api/roles/${id}`,
  );

  return response.data;
};

export const updateRoleStatus = async (
  id: number,
  isActive: boolean,
) => {
  const response = await api.put(
    `/api/roles/${id}/status`,
    {
      isActive,
    },
  );

  return response.data;
};