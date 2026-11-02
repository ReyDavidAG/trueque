import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'

export function useProducts() {
	return useQuery({
		queryKey: QUERY_KEYS.products,
		queryFn: () => services.products.list(),
	})
}

export function useLiveProducts() {
	const query = useProducts()
	const live = useMemo(
		() => (query.data ?? []).filter(p => p.status === 'live'),
		[query.data]
	)
	return { ...query, live }
}

export function useLocations() {
	return useQuery({
		queryKey: QUERY_KEYS.locations,
		queryFn: () => services.products.locations(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useLocationMap() {
	const { data } = useLocations()
	return useMemo(() => new Map((data ?? []).map(l => [l.id, l])), [data])
}

export function useCategories() {
	return useQuery({
		queryKey: QUERY_KEYS.categories,
		queryFn: () => services.products.categories(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useCompanies() {
	return useQuery({
		queryKey: QUERY_KEYS.companies,
		queryFn: () => services.panel.companies(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useCompanyMap() {
	const { data } = useCompanies()
	return useMemo(() => new Map((data ?? []).map(c => [c.id, c])), [data])
}
