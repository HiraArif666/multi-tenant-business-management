export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  businessUnitId: number | null;
  companyId: number | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}