import { useQuery } from '@tanstack/react-query';
import { getSecurityLogs } from '../services/securityLog';

export function useSecurityLogs(filters: any) {
  return useQuery({
    queryKey: ['security-logs', filters],
    queryFn: () => getSecurityLogs(filters),
  });
}
