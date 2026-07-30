export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  permissions: never[];
  roles: never[];
  success: boolean;
  message: string;

  token: string;

  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    role: string;
    businessUnitId: number | null;
    companyId: number | null;
  };
}