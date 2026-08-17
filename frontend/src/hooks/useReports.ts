import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReport,
  deleteReport,
  exportReport,
  exportSavedReport,
  generateReport,
  getReport,
  getReportModules,
  getReports,
  updateReport,
} from "../services/report";

export function useReportModules() {
  return useQuery({
    queryKey: ["report-modules"],
    queryFn: getReportModules,
  });
}

export function useReportsList(params?: any) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => getReports(params),
  });
}

export function useReport(id?: number) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => getReport(id!),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-modules"] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (payload: any) => generateReport(payload),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: (payload: any) => exportReport(payload),
  });
}

export function useExportSavedReport() {
  return useMutation({
    mutationFn: (id: number) => exportSavedReport(id),
  });
}
