import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/queryKeys'
import { services } from '@/services/api/unitOfServices'
import type { LocationInput, StoreConfig } from '@/types/configType'
import type { CategoryInput, CategoryPatch } from '@/types/productType'

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

export function useCreateCategory() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (input: CategoryInput) => services.config.createCategory(input),
		onSuccess: refresh,
	})
}

export function useUpdateCategories() {
	const refresh = useRefreshCatalog()
	return useMutation({
		mutationFn: (rows: { code: string; patch: CategoryPatch }[]) =>
			Promise.all(
				rows.map(r => services.config.updateCategory(r.code, r.patch))
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
