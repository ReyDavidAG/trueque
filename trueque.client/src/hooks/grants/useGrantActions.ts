import { useMutation, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/queryKeys'
import { services } from '@/services/api/unitOfServices'
import type { GrantInput } from '@/types/grantType'

function useRefreshGrants() {
	const client = useQueryClient()
	return () => {
		void client.invalidateQueries({ queryKey: QUERY_KEYS.grants })
		void client.invalidateQueries({ queryKey: ['notifications'] })
	}
}

export function useSaveGrant() {
	const refresh = useRefreshGrants()
	return useMutation({
		mutationFn: async ({
			input,
			submit,
		}: {
			input: GrantInput
			submit: boolean
		}) => {
			const id = await services.grants.save(input)
			if (submit) await services.grants.submit(id)
			return id
		},
		onSettled: refresh,
	})
}

export function useSubmitGrant() {
	const refresh = useRefreshGrants()
	return useMutation({
		mutationFn: (id: string) => services.grants.submit(id),
		onSuccess: refresh,
	})
}

export function useDecideGrant() {
	const refresh = useRefreshGrants()
	return useMutation({
		mutationFn: (v: { id: string; approve: boolean; note: string | null }) =>
			services.grants.decide(v.id, v.approve, v.note),
		onSuccess: refresh,
	})
}

export function useCancelGrant() {
	const refresh = useRefreshGrants()
	return useMutation({
		mutationFn: (v: { id: string; note: string | null }) =>
			services.grants.cancel(v.id, v.note),
		onSuccess: refresh,
	})
}

export function useSetGrantFund() {
	const refresh = useRefreshGrants()
	return useMutation({
		mutationFn: (v: { year: number; amount: number }) =>
			services.grants.setFund(v.year, v.amount),
		onSuccess: refresh,
	})
}
