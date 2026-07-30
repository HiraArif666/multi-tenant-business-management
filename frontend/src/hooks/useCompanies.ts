import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  updateCompanyStatus,
  deleteCompany,
} from "../services/company";
// If the ../types module doesn't export these payload types, fall back to any
// to avoid type errors. Replace with proper imports when available.
type CreateCompanyPayload = any;
type UpdateCompanyPayload = any;

export function useCompanies(
  basePath: string,
  filters: any,
) {
  return useQuery({
    queryKey: ["companies", basePath, filters],
    queryFn: () => getCompanies(basePath, filters),
    enabled: !!basePath,
  });
}

export function useCompany(
  basePath: string,
  id?: number,
) {
  return useQuery({
    queryKey: ["company", basePath, id],
    queryFn: () => getCompany(basePath, id!),
    enabled: !!basePath && !!id,
  });
}

export function useCreateCompany(basePath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyPayload) =>
      createCompany(basePath, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", basePath],
      });
    },
  });
}

export function useUpdateCompany(basePath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCompanyPayload;
    }) => updateCompany(basePath, id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", basePath],
      });
    },
  });
}

export function useUpdateCompanyStatus(
  basePath: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: number;
      isActive: boolean;
    }) => updateCompanyStatus(basePath, id, isActive),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", basePath],
      });
    },
  });
}

export function useDeleteCompany(basePath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deleteCompany(basePath, id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies", basePath],
      });
    },
  });
}