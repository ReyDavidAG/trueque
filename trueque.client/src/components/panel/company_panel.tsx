import { useMemo } from 'react'

import { DemoNote, EmptyState } from '@/components/ui/state_views'
import { useRequiredSession } from '@/hooks/auth/use_session'
import {
	useCompanyMap,
	useLocations,
	useProducts,
} from '@/hooks/market/use_market'
import { useBudgets, useReviews } from '@/hooks/panel/use_panel'

import { BudgetCard } from './budget_card'
import { ProductRows } from './product_rows'
import { PublishForm } from './publish_form'
import { RedeemCard } from './redeem_card'

export function CompanyPanel() {
	const session = useRequiredSession()
	const companyId = session.managedCompanyIds[0] ?? session.person.companyId
	const companies = useCompanyMap()
	const products = useProducts()
	const locations = useLocations()
	const budgets = useBudgets()
	const reviews = useReviews()
	const year = new Date().getFullYear()
	const mine = useMemo(
		() => (products.data ?? []).filter(p => p.companyId === companyId),
		[products.data, companyId]
	)
	const own = mine.filter(p => p.origin === 'manual')
	const fromCustodia = mine.filter(p => p.origin === 'custodia')
	const places = useMemo(
		() => (locations.data ?? []).filter(l => l.companyId === companyId),
		[locations.data, companyId]
	)
	const budget = budgets.data?.find(
		b => b.companyId === companyId && b.period === year
	)
	const reviewMap = useMemo(
		() => new Map((reviews.data ?? []).map(r => [r.productId, r])),
		[reviews.data]
	)
	const companyName =
		companies.get(companyId)?.name ?? session.person.companyName

	return (
		<div className='wrap'>
			<header className='page-head'>
				<p className='kicker'>{companyName}</p>
				<h1 className='h1'>Tu puesto en El Trueque</h1>
				<p className='lede'>
					Lo que ofreces a tu gente, cuánto del presupuesto se ha usado y los
					cupones por canjear.
				</p>
			</header>
			{budget && <BudgetCard budget={budget} companyName={companyName} />}
			<div className='panel-split'>
				<div>
					<section className='section'>
						<div className='section__head'>
							<h2 className='h3'>Tus productos</h2>
						</div>
						{own.length ? (
							<ProductRows products={own} reviews={reviewMap} />
						) : (
							<EmptyState
								title='Todavía no publicas nada'
								body='Manda tu primer producto a RH con el formulario.'
							/>
						)}
					</section>
					<section className='section'>
						<div className='section__head'>
							<h2 className='h3'>Llegan de Custodia</h2>
							<p className='muted'>
								Equipo dado de baja que todavía sirve. RH revisa el precio antes
								de publicarlo.
							</p>
						</div>
						{fromCustodia.length ? (
							<ProductRows products={fromCustodia} reviews={reviewMap} />
						) : (
							<p className='muted'>Nada por ahora.</p>
						)}
					</section>
				</div>
				<div className='stack panel-side'>
					<RedeemCard locations={places} />
					<section>
						<div className='section__head'>
							<h2 className='h3'>Publicar un producto</h2>
						</div>
						<PublishForm companyId={companyId} locations={places} />
					</section>
				</div>
			</div>
			<DemoNote>Presupuesto y productos de prueba.</DemoNote>
		</div>
	)
}
