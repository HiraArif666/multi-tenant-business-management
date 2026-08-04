import api from "./api";

export const getApprovableModules = async () => {
  const response = await api.get(
    "/api/settings/approval-settings/modules",
  );

  return response.data;
};

export const getApproverOptions = async () => {
  const response = await api.get(
    "/api/settings/approval-settings/approvers",
  );

  return response.data;
};

export const getApprovalSetting = async (
  moduleName: string,
) => {
  const response = await api.get(
    `/api/settings/approval-settings/${moduleName}`,
  );

  return response.data;
};

export const upsertApprovalSetting = async (
  moduleName: string,
  approverIds: number[],
) => {
  const response = await api.put(
    `/api/settings/approval-settings/${moduleName}`,
    { approverIds },
  );

  return response.data;
};