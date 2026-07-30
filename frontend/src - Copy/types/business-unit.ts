export interface BusinessUnit {
  id: number;
  name: string;
  description?: string;

  adminId: number | null;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;

  adminName?: string;
}

export interface CreateBusinessUnitRequest {
  name: string;
  description?: string;

  admin: {
    username: string;
    email: string;
    password: string;
    name: string;
  };
}