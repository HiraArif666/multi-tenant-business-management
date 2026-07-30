export type UserRole =
  | "superadmin"
  | "bu-admin"
  | "company-admin"
  | "user";

export interface User {
  id: number;

  username: string;

  email: string;

  name: string;

  profilePicture: string | null;

  role: UserRole;

  businessUnitId: number | null;

  companyId: number | null;

  isActive: boolean;
}

export interface CreateUserPayload {
  name: string;

  username: string;

  email: string;

  password: string;

  profilePicture?: string | null;

  roleIds?: number[];
}

export interface UpdateUserPayload {
  name?: string;

  username?: string;

  email?: string;

  password?: string;

  profilePicture?: string | null;

  roleIds?: number[];

  isActive?: boolean;
}