import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getApprovableModules,
  getApproverOptions,
  getApprovalSetting,
  upsertApprovalSetting,
} from "../services/approvalSettings";

export function useApprovableModules() {
  return useQuery({
    queryKey: ["approvable-modules"],
    queryFn: getApprovableModules,
  });
}

export function useApproverOptions() {
  return useQuery({
    queryKey: ["approver-options"],
    queryFn: getApproverOptions,
  });
}

export function useApprovalSetting(
  moduleName?: string,
) {
  return useQuery({
    queryKey: ["approval-setting", moduleName],
    queryFn: () => getApprovalSetting(moduleName!),
    enabled: !!moduleName,
  });
}

export function useUpsertApprovalSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleName,
      approverIds,
    }: {
      moduleName: string;
      approverIds: number[];
    }) => upsertApprovalSetting(moduleName, approverIds),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "approval-setting",
          variables.moduleName,
        ],
      });
    },
  });
}