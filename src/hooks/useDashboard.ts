import { useQuery } from '@tanstack/react-query'
import { getDashboard, type DashboardData } from '@/api/vault'

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 30_000,
  })
}
