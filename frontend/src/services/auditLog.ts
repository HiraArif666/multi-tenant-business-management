import api from "./api";

export const getAuditLogs = async (params?: any) => {
  const response = await api.get("/api/audit-logs", {
    params,
  });

  return response.data;
};

export const getAuditLogModules = async () => {
  const response = await api.get(
    "/api/audit-logs/modules",
  );

  return response.data;
};