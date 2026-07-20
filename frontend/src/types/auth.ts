export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  businessUnitId: number | null;
  companyId: number | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: LoginUser;
}

export type UserRole =
  | "superadmin"
  | "bu-admin"
  | "company-admin"
  | "user";