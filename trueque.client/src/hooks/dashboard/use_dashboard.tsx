import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'

export function useDashboard() {
	return useQuery({
		queryKey: QUERY_KEYS.dashboard,
		queryFn: () => services.dashboard.load(),
	})
}
