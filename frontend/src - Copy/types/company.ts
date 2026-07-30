export interface Company {
  id: number;

  name: string;

  description?: string;

  companyTypeId: number;

  businessUnitId: number;

  adminId?: number;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}