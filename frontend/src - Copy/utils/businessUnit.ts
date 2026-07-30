const BUSINESS_UNIT_KEY = "selected_business_unit";

export const setSelectedBusinessUnit = (businessUnit: any) => {
  localStorage.setItem(
    BUSINESS_UNIT_KEY,
    JSON.stringify(businessUnit)
  );
};

export const getSelectedBusinessUnit = () => {
  const data = localStorage.getItem(BUSINESS_UNIT_KEY);

  return data ? JSON.parse(data) : null;
};

export const clearSelectedBusinessUnit = () => {
  localStorage.removeItem(BUSINESS_UNIT_KEY);
};