import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'
import type { PriceReview } from '@/types/panel_type'
import type { NewProduct, ProductStatus } from '@/types/product_type'

export function useBudgets() {
	return useQuery({
		queryKey: QUERY_KEYS.budgets,
		queryFn: () => services.panel.budgets(),
	})
}

export function useReviews() {
	return useQuery({
		queryKey: QUERY_KEYS.reviews,
		queryFn: () => services.panel.reviews(),
	})
}

function useRefreshPanel() {
	const client = useQueryClient()
	return () => {
		void client.invalidateQueries({ queryKey: QUERY_KEYS.products })
		void client.invalidateQueries({ queryKey: ['panel'] })
	}
}

export function usePublishProduct() {
	const { person } = useRequiredSession()
	const refresh = useRefreshPanel()
	return useMutation({
		mutationFn: (input: NewProduct) =>
			services.products.create(input, person.id),
		onSuccess: refresh,
	})
}

export function useSetProductStatus() {
	const refresh = useRefreshPanel()
	return useMutation({
		mutationFn: (v: { id: string; status: ProductStatus }) =>
			services.products.setStatus(v.id, v.status),
		onSuccess: refresh,
	})
}

export function useReviewPrice() {
	const refresh = useRefreshPanel()
	return useMutation({
		mutationFn: (v: {
			productId: string
			decision: PriceReview['decision']
			finalPrice: number | null
			note: string | null
		}) =>
			services.panel.reviewPrice(v.productId, v.decision, v.finalPrice, v.note),
		onSuccess: refresh,
	})
}

export function useRedeem() {
	const refresh = useRefreshPanel()
	return useMutation({
		mutationFn: (v: { code: string; locationId: string | null }) =>
			services.trades.redeem(v.code, v.locationId),
		onSuccess: refresh,
	})
}
