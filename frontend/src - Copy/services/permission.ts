import api from "./api";

export const getPermissions = async () => {
  const response = await api.get(
    "/api/roles/permissions/all"
  );

  return response.data;
};