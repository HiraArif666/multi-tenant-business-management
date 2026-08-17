import api from "./api";

export const getReportModules = async () => {
  const response = await api.get("/api/reports/modules");
  return response.data;
};

export const getReports = async (params?: any) => {
  const response = await api.get("/api/reports", {
    params,
  });

  return response.data;
};

export const getReport = async (id: number) => {
  const response = await api.get(`/api/reports/${id}`);
  return response.data;
};

export const createReport = async (data: any) => {
  const response = await api.post("/api/reports", data);
  return response.data;
};

export const updateReport = async (id: number, data: any) => {
  const response = await api.put(`/api/reports/${id}`, data);
  return response.data;
};

export const deleteReport = async (id: number) => {
  const response = await api.delete(`/api/reports/${id}`);
  return response.data;
};

export const generateReport = async (data: any) => {
  const response = await api.post("/api/reports/generate", data);
  return response.data;
};

export const exportReport = async (data: any) => {
  const response = await api.post("/api/reports/export", data, {
    responseType: "blob",
  });

  return response.data;
};

export const exportSavedReport = async (id: number) => {
  const response = await api.get(`/api/reports/${id}/export`, {
    responseType: "blob",
  });

  return response.data;
};
