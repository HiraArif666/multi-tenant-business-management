import api from "./api";

export const selectBusinessUnit = async (
  businessUnitId: number
) => {
  const { data } = await api.post(
    `/api/business-units/${businessUnitId}/select`
  );

  return data;
};