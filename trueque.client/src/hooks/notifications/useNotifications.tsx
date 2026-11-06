import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/queryKeys'
import { useRequiredSession } from '@/hooks/auth/useSession'
import { services } from '@/services/api/unitOfServices'

export function useNotifications() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.notifications(person.id),
		queryFn: () => services.notifications.list(),
		refetchInterval: 60_000,
	})
}

export function useMarkAllRead() {
	const { person } = useRequiredSession()
	const client = useQueryClient()
	return useMutation({
		mutationFn: () => services.notifications.markAllRead(),
		onSuccess: () =>
			void client.invalidateQueries({
				queryKey: QUERY_KEYS.notifications(person.id),
			}),
	})
}
