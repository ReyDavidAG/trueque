import { useRef, useState } from 'react'

import { BoardCard } from '@/components/market/boardCard'
import { CompanyFilter } from '@/components/market/companyFilter'
import { Explainer } from '@/components/market/explainer'
import { Pager } from '@/components/market/pager'
import { PurseCard } from '@/components/market/purseCard'
import { ResultsBar } from '@/components/market/resultsBar'
import { DemoNote, EmptyState, ErrorState } from '@/components/ui/stateViews'
import { useCovers } from '@/hooks/market/useImages'
import { useShelf } from '@/hooks/market/useShelf'
import { prefersReducedMotion } from '@/utils/reducedMotion'

const PAGE_SIZE = 16

function BoardSkeletons() {
	return (
		<div className='bgrid' aria-busy='true' aria-label='Cargando la despensa'>
			{Array.from({ length: 8 }, (_, i) => (
				<div key={i} className='bcard bcard--ghost' style={{ '--i': i }}>
					<div className='ghost ghost--art' />
					<div className='ghost ghost--line' />
					<div className='ghost ghost--line is-short' />
				</div>
			))}
		</div>
	)
}

export default function MarketPage() {
	const shelf = useShelf()
	const { products, shown } = shelf
	const [paging, setPaging] = useState({ key: '', page: 0 })
	const top = useRef<HTMLElement>(null)
	const covers = useCovers(products.live)
	const filterKey = `${shelf.company}|${shelf.category}|${shelf.affordable}|${shelf.sort}`
	const page = paging.key === filterKey ? paging.page : 0
	const pages = Math.ceil(shown.length / PAGE_SIZE)
	const current = Math.min(page, Math.max(0, pages - 1))
	const slice = shown.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

	const turn = (next: number) => {
		setPaging({ key: filterKey, page: next })
		const y = top.current?.getBoundingClientRect().top
		if (y !== undefined && y < 0)
			window.scrollBy({
				top: y - 80,
				behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			})
	}

	const grid = products.isLoading ? (
		<BoardSkeletons />
	) : products.error ? (
		<ErrorState
			message={products.error.message}
			onRetry={() => void products.refetch()}
		/>
	) : shown.length ? (
		<>
			<div key={`${filterKey}|${current}`} className='bgrid'>
				{slice.map((p, i) => (
					<BoardCard
						key={p.id}
						product={p}
						balance={shelf.balance}
						index={i}
						cover={covers.get(p.id)}
						companyName={shelf.names.get(p.companyId)?.name ?? ''}
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
					: 'La despensa todavía no abre'
			}
			body={
				products.live.length
					? 'Quita "sólo lo que me alcanza" o elige otra empresa para ver más.'
					: 'Tu empresa aún no publica productos. Vuelve pronto.'
			}
			onAngry={products.live.length ? shelf.reset : undefined}
		/>
	)

	return (
		<div className='wrap wrap--wide'>
			<div className='shelf'>
				<aside className='shelf__side' aria-label='Tus yemas y filtros'>
					<PurseCard />
					<CompanyFilter
						options={shelf.options}
						value={shelf.company}
						onChange={shelf.setCompany}
					/>
					<Explainer products={products.live} />
				</aside>
				<section
					ref={top}
					className='shelf__main'
					aria-labelledby='board-title'>
					<header className='shelf__head'>
						<p className='kicker'>La despensa</p>
						<h1 className='shelf__title' id='board-title'>
							Lo que propones, llega a tu mesa.
						</h1>
					</header>
					<ResultsBar
						category={shelf.category}
						options={shelf.categories}
						total={shown.length}
						fits={shelf.fits}
						affordable={shelf.affordable}
						sort={shelf.sort}
						onCategory={shelf.setCategory}
						onAffordable={shelf.setAffordable}
						onSort={shelf.toggleSort}
					/>
					{grid}
					<DemoNote>Productos, precios y existencias de prueba.</DemoNote>
				</section>
			</div>
		</div>
	)
}
