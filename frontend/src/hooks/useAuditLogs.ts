import { useQuery } from "@tanstack/react-query";

import {
  getAuditLogs,
  getAuditLogModules,
} from "../services/auditLog";

export function useAuditLogs(filters: any) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => getAuditLogs(filters),
  });
}

export function useAuditLogModules() {
  return useQuery({
    queryKey: ["audit-log-modules"],
    queryFn: getAuditLogModules,
  });
}