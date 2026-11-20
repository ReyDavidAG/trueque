import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import type { CompanyOption } from '@/components/market/companyFilter'
import type { CategoryOption, PriceSort } from '@/components/market/resultsBar'
import { ALL_CATEGORIES as ALL } from '@/constants/stall'
import {
	useCategories,
	useCompanyMap,
	useLiveProducts,
} from '@/hooks/market/useMarket'
import { useBalance } from '@/hooks/wallet/useWallet'
import type { CategoryInfo, Product } from '@/types/productType'

export function useCategoryOptions(
	live: Product[],
	scoped: Product[]
): CategoryOption[] {
	const { data } = useCategories()
	return useMemo(() => {
		const count = (code: string) =>
			scoped.filter(p => p.category === code).length
		const shown = (data ?? []).filter(
			(c: CategoryInfo) => c.isActive || live.some(p => p.category === c.code)
		)
		return [
			{ id: ALL, label: 'Todo', count: scoped.length },
			...shown.map(c => ({ id: c.code, label: c.name, count: count(c.code) })),
		]
	}, [data, live, scoped])
}

const fitsIn = (balance: number) => (p: Product) =>
	balance >= p.price && p.stockLeft !== 0

function companyOptions(
	live: Product[],
	names: Map<string, { name: string }>
): CompanyOption[] {
	const byCompany = new Map<string, Product[]>()
	for (const p of live)
		byCompany.set(p.companyId, [...(byCompany.get(p.companyId) ?? []), p])
	const companies = [...byCompany.entries()]
		.map(([id, items]) => ({
			id,
			name: names.get(id)?.name ?? 'Empresa',
			count: items.length,
			art: items[0].art,
			stall: items[0].stall,
		}))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
	return [
		{
			id: ALL,
			name: 'Todo el grupo',
			count: live.length,
			art: null,
			stall: 'anil',
		},
		...companies,
	]
}

function setParam(prev: URLSearchParams, key: string, value: string) {
	const next = new URLSearchParams(prev)
	if (value === ALL) next.delete(key)
	else next.set(key, value)
	return next
}

export function useShelf() {
	const [params, setParams] = useSearchParams()
	const [affordable, setAffordable] = useState(false)
	const [sort, setSort] = useState<PriceSort>('asc')
	const products = useLiveProducts()
	const balance = useBalance().data?.balance ?? 0
	const names = useCompanyMap()
	const company = params.get('company') ?? ALL

	const options = useMemo(
		() => companyOptions(products.live, names),
		[products.live, names]
	)

	const ofCompany = useMemo(
		() => products.live.filter(p => company === ALL || p.companyId === company),
		[products.live, company]
	)

	const categories = useCategoryOptions(products.live, ofCompany)
	const rawType = params.get('type')
	const category =
		rawType && categories.some(c => c.id === rawType) ? rawType : ALL

	const shown = useMemo(() => {
		const dir = sort === 'desc' ? -1 : 1
		return ofCompany
			.filter(p => category === ALL || p.category === category)
			.filter(p => !affordable || fitsIn(balance)(p))
			.sort((a, b) => dir * (a.price - b.price))
	}, [ofCompany, category, affordable, balance, sort])

	const update = (key: string, value: string) =>
		setParams(prev => setParam(prev, key, value), { preventScrollReset: true })

	return {
		products,
		balance,
		names,
		options,
		company,
		category,
		categories,
		affordable,
		sort,
		shown,
		fits: shown.filter(fitsIn(balance)).length,
		setCompany: (id: string) => update('company', id),
		setCategory: (c: string) => update('type', c),
		setAffordable,
		toggleSort: () => setSort(s => (s === 'asc' ? 'desc' : 'asc')),
		reset: () => {
			setAffordable(false)
			setParams(new URLSearchParams(), { preventScrollReset: true })
		},
	}
}
