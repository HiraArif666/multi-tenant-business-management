import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
} from "../services/expense";

import type {
  CreateExpensePayload,
  UpdateExpensePayload,
} from "../types/expense";

export function useExpenses(filters: any) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => getExpenses(filters),
  });
}

export function useExpense(id?: number) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpense(id!),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpensePayload) =>
      createExpense(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateExpensePayload;
    }) => updateExpense(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveExpense(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rejectExpense(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
  });
}