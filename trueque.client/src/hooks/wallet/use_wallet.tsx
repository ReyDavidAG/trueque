import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'

export function useBalance() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.balance(person.id),
		queryFn: () => services.wallet.balance(person.id),
	})
}

export function useLots() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.lots(person.id),
		queryFn: () => services.wallet.lots(person.id),
	})
}

export function useMovements() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.movements(person.id),
		queryFn: () => services.wallet.movements(person.id),
	})
}

export function useRules() {
	return useQuery({
		queryKey: QUERY_KEYS.rules,
		queryFn: () => services.wallet.rules(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useCoupons() {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.coupons(person.id),
		queryFn: () => services.trades.coupons(person.id),
	})
}

export function useReceipt(folio: string) {
	return useQuery({
		queryKey: QUERY_KEYS.receipt(folio),
		queryFn: () => services.trades.receipt(folio),
	})
}

export function useTrade() {
	const client = useQueryClient()
	const { person } = useRequiredSession()
	return useMutation({
		mutationFn: (productId: string) => services.trades.trade(productId),
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: ['wallet', person.id] })
			void client.invalidateQueries({ queryKey: QUERY_KEYS.products })
		},
	})
}
