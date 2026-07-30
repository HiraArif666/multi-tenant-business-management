import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBusinessUnits,
  getBusinessUnit,
  createBusinessUnit,
  updateBusinessUnit,
  deleteBusinessUnit,
  selectBusinessUnit,
} from "../services/businessUnit";

export function useBusinessUnits(filters: any) {
  return useQuery({
    queryKey: ["business-units", filters],
    queryFn: () => getBusinessUnits(filters),
  });
}

export function useBusinessUnit(
  id: number | string
) {
  return useQuery({
    queryKey: ["business-unit", id],
    queryFn: () => getBusinessUnit(id),
    enabled: !!id,
  });
}

export function useCreateBusinessUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBusinessUnit,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-units"],
      });
    },
  });
}

export function useUpdateBusinessUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: any;
    }) =>
      updateBusinessUnit(
        id,
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-units"],
      });
    },
  });
}

export function useDeleteBusinessUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBusinessUnit,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-units"],
      });
    },
  });
}

/* =====================================
   SELECT BUSINESS UNIT
===================================== */

export function useSelectBusinessUnit() {
  return useMutation({
    mutationFn: (id: number | string) =>
      selectBusinessUnit(id),
  });
}