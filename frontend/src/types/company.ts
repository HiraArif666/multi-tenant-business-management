export interface Company {
  id: number;

  name: string;

  description?: string;

  companyTypeId: number;

  businessUnitId: number;

  adminId?: number;

  // Add these fields
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateCompanyPayload {
  name: string;
  email?: string;
  phone?: string;
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
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string | null;
  isActive?: boolean;

  admin?: {
    username?: string;
    password?: string;
    name?: string;
    email?: string;
  };
}