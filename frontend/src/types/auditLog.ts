export type AuditAction = "create" | "update" | "delete";

export interface AuditLog {
  id: number;

  userId: number | null;
  userName: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  module: string;
  tableName: string;
  recordId: string | null;

  action: AuditAction;

  beforeValues: Record<string, any> | null;
  afterValues: Record<string, any> | null;

  businessUnitId: number | null;

  createdAt: string;
}