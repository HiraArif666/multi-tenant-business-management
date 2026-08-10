import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '../services/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => getDashboardOverview(),
  });
}
