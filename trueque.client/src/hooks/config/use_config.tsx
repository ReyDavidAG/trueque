import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'
import type { LocationInput, StoreConfig } from '@/types/config_type'

export function useConfig() {
	return useQuery({
		queryKey: QUERY_KEYS.config,
		queryFn: () => services.config.get(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useCacaoValue() {
	return useConfig().data?.cacaoValue ?? 5
}

function useRefreshCatalog() {
	const client = useQueryClient()
	return () => {
		void client.invalidateQueries({ queryKey: ['catalog'] })
		void client.invalidateQueries({ queryKey: ['panel'] })
	}
}

export function useSetConfig() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (patch: Partial<StoreConfig>) => services.config.set(patch),
		onSuccess: refresh,
	})
}

export function useSetRules() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (
			rules: {
				code: string
				cacaos?: number
				monthlyCap: number | null
				isActive: boolean
			}[]
		) => Promise.all(rules.map(r => services.config.setRule(r.code, r))),
		onSuccess: refresh,
	})
}

export function useSetCategories() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (rows: { code: string; min: number; max: number }[]) =>
			Promise.all(
				rows.map(r => services.config.setCategory(r.code, r.min, r.max))
			),
		onSuccess: refresh,
	})
}

export function useSetBudgets() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (
			rows: { companyId: string; period: number; assigned: number }[]
		) =>
			Promise.all(
				rows.map(r =>
					services.config.setBudget(r.companyId, r.period, r.assigned)
				)
			),
		onSuccess: refresh,
	})
}

export function useSaveLocation() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (input: LocationInput) => services.config.saveLocation(input),
		onSuccess: refresh,
	})
}
