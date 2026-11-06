import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/queryKeys'
import { services } from '@/services/api/unitOfServices'

export function useDashboard() {
	return useQuery({
		queryKey: QUERY_KEYS.dashboard,
		queryFn: () => services.dashboard.load(),
	})
}
