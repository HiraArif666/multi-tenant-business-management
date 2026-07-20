import type { UserRole } from "./auth";

export interface User {
  id: number;

  username: string;

  email: string;

  name: string;

  role: UserRole;

  businessUnitId: number | null;

  companyId: number | null;

  isActive: boolean;
}