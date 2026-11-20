import type { DeepPartialSkipArrayKey } from 'react-hook-form'

import { useCacaoValue } from '@/hooks/config/useConfig'
import type { GrantForm } from '@/schemas/grants/grant.schema'

import { useGrantPreview } from './useGrants'

export type GiftValues = DeepPartialSkipArrayKey<GrantForm>

export function useGiftTotals(values: GiftValues) {
	const cacaoValue = useCacaoValue()
	const scope = values.scope ?? 'group'
	const preview = useGrantPreview(scope, values.scopeId ?? '')
	const list = values.list ?? []
	const isList = scope === 'list'
	const people = isList ? list.length : (preview.data ?? 0)
	const yemas = isList
		? list.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
		: people * (Number(values.amount) || 0)
	return {
		people,
		yemas,
		pesos: yemas * cacaoValue,
		counting: !isList && preview.isFetching,
	}
}
