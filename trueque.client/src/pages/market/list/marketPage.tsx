import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Explainer } from '@/components/market/explainer'
import {
	type CategoryFilter,
	MarketFilters,
} from '@/components/market/marketFilters'
import { Pager } from '@/components/market/pager'
import { Stall } from '@/components/market/stall'
import {
	DemoNote,
	EmptyState,
	ErrorState,
	StallSkeletons,
} from '@/components/ui/stateViews'
import { CATEGORY_LABELS } from '@/constants/stall'
import { useCovers } from '@/hooks/market/useImages'
import { useCompanyMap, useLiveProducts } from '@/hooks/market/useMarket'
import { useBalance } from '@/hooks/wallet/useWallet'

const PAGE_SIZE = 12

const isCategory = (v: string | null): v is CategoryFilter =>
	!!v && v in CATEGORY_LABELS

export default function MarketPage() {
	const [params, setParams] = useSearchParams()
	const [affordable, setAffordable] = useState(false)
	const [page, setPage] = useState(0)
	const tools = useRef<HTMLDivElement>(null)
	const raw = params.get('type')
	const category: CategoryFilter = isCategory(raw) ? raw : 'all'
	const products = useLiveProducts()
	const money = useBalance().data?.balance ?? 0
	const covers = useCovers(products.live)
	const companies = useCompanyMap()

	const shown = useMemo(
		() =>
			products.live
				.filter(p => category === 'all' || p.category === category)
				.filter(p => !affordable || (money >= p.price && p.stockLeft !== 0)),
		[products.live, category, affordable, money]
	)

	const pages = Math.ceil(shown.length / PAGE_SIZE)
	const current = Math.min(page, Math.max(0, pages - 1))
	const slice = shown.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

	const turn = (next: number) => {
		setPage(next)
		const top = tools.current?.getBoundingClientRect().top
		if (top !== undefined && top < 0)
			window.scrollBy({
				top: top - 80,
				behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
					? 'auto'
					: 'smooth',
			})
	}

	const setCategory = (c: CategoryFilter) => {
		setPage(0)
		setParams(
			prev => {
				const next = new URLSearchParams(prev)
				if (c === 'all') next.delete('type')
				else next.set('type', c)
				return next
			},
			{ preventScrollReset: true }
		)
	}

	return (
		<div className='wrap'>
			<header className='market-head'>
				<h1 className='display'>
					Lo que siembras en Chispa, aquí lo cosechas.
				</h1>
				<p className='lede'>
					Los ganas proponiendo en Chispa. Aquí los cambias por servicios y
					artículos de las empresas del grupo.
				</p>
			</header>
			<Explainer products={products.live} />
			<div ref={tools}>
				<MarketFilters
					category={category}
					affordable={affordable}
					onCategory={setCategory}
					onAffordable={v => {
						setPage(0)
						setAffordable(v)
					}}
				/>
			</div>
			{products.isLoading ? (
				<StallSkeletons />
			) : products.error ? (
				<ErrorState
					message={products.error.message}
					onRetry={() => void products.refetch()}
				/>
			) : shown.length ? (
				<>
					<div key={current} className='stalls'>
						{slice.map((p, i) => (
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
					<Pager
						page={current}
						pages={pages}
						total={shown.length}
						size={PAGE_SIZE}
						onPage={turn}
					/>
				</>
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
