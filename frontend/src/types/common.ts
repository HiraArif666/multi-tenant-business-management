export interface Company {
  id: number;

  name: string;
  description: string | null;

  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  logo: string | null;

  businessUnitId: number;
  companyTypeId: number;
  adminId: number | null;

  isActive: boolean;

  createdByName?: string;
  updatedByName?: string;

  admin?: {
    id: number;
    name: string;
    username: string;
    email: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo?: string | null;

  admin: {
    username: string;
    password: string;
    name: string;
    email: string;
  };
}

export interface UpdateCompanyPayload {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo?: string | null;
  isActive?: boolean;
}