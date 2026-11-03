import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'
import type { Product } from '@/types/product_type'

export function useProductImages(id: string | undefined, enabled = true) {
	return useQuery({
		queryKey: QUERY_KEYS.images(id ?? ''),
		queryFn: () => services.products.images(id ?? ''),
		enabled: !!id && enabled,
	})
}

export function useCovers(products: Product[]) {
	const ids = useMemo(
		() =>
			products
				.filter(p => p.hasImages)
				.map(p => p.id)
				.sort(),
		[products]
	)
	const query = useQuery({
		queryKey: QUERY_KEYS.covers(ids.join(',')),
		queryFn: () => services.products.covers(ids),
		enabled: ids.length > 0,
	})
	return query.data ?? new Map<string, string>()
}
