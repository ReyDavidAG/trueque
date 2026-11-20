import { useQuery } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/queryKeys'
import { services } from '@/services/api/unitOfServices'
import type { GrantScope } from '@/types/grantType'

export function useGrants() {
	return useQuery({
		queryKey: QUERY_KEYS.grants,
		queryFn: () => services.grants.list(),
	})
}

export function useGrant(id: string | undefined) {
	return useQuery({
		queryKey: QUERY_KEYS.grant(id ?? ''),
		queryFn: () => services.grants.get(id ?? ''),
		enabled: !!id,
	})
}

export function useGrantRecipients(id: string) {
	return useQuery({
		queryKey: QUERY_KEYS.grantRecipients(id),
		queryFn: () => services.grants.recipients(id),
		enabled: !!id,
	})
}

export function useGrantEvents(id: string) {
	return useQuery({
		queryKey: QUERY_KEYS.grantEvents(id),
		queryFn: () => services.grants.events(id),
	})
}

export function useGrantOccasions() {
	return useQuery({
		queryKey: QUERY_KEYS.grantOccasions,
		queryFn: () => services.grants.occasions(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useGrantScopes() {
	return useQuery({
		queryKey: QUERY_KEYS.grantScopes,
		queryFn: () => services.grants.scopes(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useGrantFund(year: number) {
	return useQuery({
		queryKey: QUERY_KEYS.grantFund(year),
		queryFn: () => services.grants.fund(year),
	})
}

export function useGrantPreview(scope: GrantScope, scopeId: string) {
	const needsId =
		scope === 'company' || scope === 'area' || scope === 'department'
	return useQuery({
		queryKey: QUERY_KEYS.grantPreview(scope, scopeId),
		queryFn: () => services.grants.preview(scope, needsId ? scopeId : null),
		enabled: scope !== 'list' && (!needsId || !!scopeId),
	})
}
