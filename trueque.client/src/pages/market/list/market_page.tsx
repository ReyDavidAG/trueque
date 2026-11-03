import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Explainer } from '@/components/market/explainer'
import {
	type CategoryFilter,
	MarketFilters,
} from '@/components/market/market_filters'
import { Purse } from '@/components/market/purse'
import { Stall } from '@/components/market/stall'
import {
	DemoNote,
	EmptyState,
	ErrorState,
	StallSkeletons,
} from '@/components/ui/state_views'
import { CATEGORY_LABELS } from '@/constants/stall'
import { useCovers } from '@/hooks/market/use_images'
import { useCompanyMap, useLiveProducts } from '@/hooks/market/use_market'
import { useBalance } from '@/hooks/wallet/use_wallet'

const isCategory = (v: string | null): v is CategoryFilter =>
	!!v && v in CATEGORY_LABELS

export default function MarketPage() {
	const [params, setParams] = useSearchParams()
	const [affordable, setAffordable] = useState(false)
	const raw = params.get('type')
	const category: CategoryFilter = isCategory(raw) ? raw : 'all'
	const products = useLiveProducts()
	const balance = useBalance()
	const money = balance.data?.balance ?? 0
	const covers = useCovers(products.live)
	const companies = useCompanyMap()

	const shown = useMemo(
		() =>
			products.live
				.filter(p => category === 'all' || p.category === category)
				.filter(p => !affordable || (money >= p.price && p.stockLeft !== 0)),
		[products.live, category, affordable, money]
	)

	const setCategory = (c: CategoryFilter) =>
		setParams(
			prev => {
				const next = new URLSearchParams(prev)
				if (c === 'all') next.delete('type')
				else next.set('type', c)
				return next
			},
			{ preventScrollReset: true }
		)

	return (
		<div className='wrap'>
			<header className='market-head'>
				<h1 className='display'>Lo que siembras en Chispa, aquí lo cosechas.</h1>
				<p className='lede'>
					Los ganas proponiendo en Chispa. Aquí los cambias por servicios y
					artículos de las empresas del grupo.
				</p>
			</header>
			{balance.data && <Purse balance={balance.data} />}
			<Explainer products={products.live} />
			<MarketFilters
				category={category}
				affordable={affordable}
				onCategory={setCategory}
				onAffordable={setAffordable}
			/>
			{products.isLoading ? (
				<StallSkeletons />
			) : products.error ? (
				<ErrorState
					message={products.error.message}
					onRetry={() => void products.refetch()}
				/>
			) : shown.length ? (
				<div className='stalls'>
					{shown.map((p, i) => (
						<Stall
							key={p.id}
							product={p}
							balance={money}
							index={i}
							cover={covers.get(p.id)}
							companyName={companies.get(p.companyId)?.name ?? ''}
						/>
					))}
				</div>
			) : (
				<EmptyState
					art='closed'
					title={
						products.live.length
							? 'Nada por aquí con esos filtros'
							: 'El mercado todavía no abre'
					}
					body={
						products.live.length
							? 'Quita "sólo lo que me alcanza" o cambia de tipo para ver más.'
							: 'Tu empresa aún no publica productos. Vuelve pronto.'
					}
					onAngry={
						products.live.length
							? () => {
									setAffordable(false)
									setCategory('all')
								}
							: undefined
					}
				/>
			)}
			<DemoNote>Productos, precios y existencias de prueba.</DemoNote>
		</div>
	)
}
