import { useMemo } from 'react'

import { DemoNote, EmptyState } from '@/components/ui/state_views'
import {
	useCategories,
	useCompanyMap,
	useProducts,
} from '@/hooks/market/use_market'
import { useBudgets } from '@/hooks/panel/use_panel'

import { BudgetCard } from './budget_card'
import { ReviewCard } from './review_card'

export function HrPanel() {
	const products = useProducts()
	const categories = useCategories()
	const companies = useCompanyMap()
	const budgets = useBudgets()
	const year = new Date().getFullYear()
	const pending = useMemo(
		() => (products.data ?? []).filter(p => p.status === 'pending'),
		[products.data]
	)
	const ranges = useMemo(
		() => new Map((categories.data ?? []).map(c => [c.code, c])),
		[categories.data]
	)
	const current = (budgets.data ?? []).filter(
		b => b.period === year && b.assigned > 0
	)

	return (
		<div className='wrap'>
			<header className='page-head'>
				<p className='kicker'>RH corporativo</p>
				<h1 className='h1'>Precios por aprobar</h1>
				<p className='lede'>
					Cada empresa propone el precio de lo que ofrece. Tú cuidas que cueste
					lo mismo en todas.
				</p>
			</header>
			{pending.length ? (
				<div className='approvals'>
					{pending.map((p, i) => (
						<ReviewCard
							key={p.id}
							product={p}
							range={ranges.get(p.category)}
							companyName={companies.get(p.companyId)?.name ?? ''}
							index={i}
						/>
					))}
				</div>
			) : (
				!products.isLoading && (
					<EmptyState
						title='Nada por aprobar'
						body='Cuando una empresa mande un producto, aparece aquí.'
					/>
				)
			)}
			{current.length > 0 && (
				<section className='section'>
					<div className='section__head'>
						<h2 className='h3'>Presupuestos {year}</h2>
					</div>
					<div className='stack'>
						{current.map(b => (
							<BudgetCard
								key={b.companyId}
								budget={b}
								companyName={companies.get(b.companyId)?.name ?? ''}
							/>
						))}
					</div>
				</section>
			)}
			<DemoNote>Productos y presupuestos de prueba.</DemoNote>
		</div>
	)
}
