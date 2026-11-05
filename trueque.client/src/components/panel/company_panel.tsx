import { useMemo } from 'react'
import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { DemoNote, EmptyState } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useCovers } from '@/hooks/market/use_images'
import { useCompanyMap, useProducts } from '@/hooks/market/use_market'
import { useBudgets } from '@/hooks/panel/use_panel'

import { BudgetVault } from './budget_card'
import { ProductRows } from './product_rows'

export function CompanyPanel() {
	const session = useRequiredSession()
	const companyId = session.managedCompanyIds[0] ?? session.person.companyId
	const companies = useCompanyMap()
	const products = useProducts()
	const budgets = useBudgets()
	const year = new Date().getFullYear()
	const mine = useMemo(
		() => (products.data ?? []).filter(
				p => p.companyId === companyId && p.status !== 'retired'
			),
		[products.data, companyId]
	)
	const covers = useCovers(mine)
	const own = mine.filter(p => p.origin === 'manual')
	const fromCustodia = mine.filter(p => p.origin === 'custodia')
	const budget = budgets.data?.find(
		b => b.companyId === companyId && b.period === year
	)
	const companyName =
		companies.get(companyId)?.name ?? session.person.companyName

	return (
		<div className='wrap'>
			<header className='page-head page-head--row'>
				<div>
					<p className='kicker'>{companyName}</p>
					<h1 className='h1'>Tu puesto en El Trueque</h1>
					<p className='lede'>
						Lo que ofreces a tu gente y cuánto del presupuesto se ha usado.
					</p>
				</div>
				<div className='page-head__actions panel-actions'>
					<Link className='btn btn--ghost' to={ROUTES.redeem}>
						<Icon name='scan' />
						Canjear cupón
					</Link>
					<Link className='btn btn--grana panel-actions__new' to={ROUTES.newProduct}>
						<Icon name='plus' />
						Publicar producto
					</Link>
				</div>
			</header>
			{budget && <BudgetVault budget={budget} />}
			<section className='section'>
				<div className='section__head'>
					<h2 className='h3'>Tus productos</h2>
					<p className='muted'>
						Si cambias el precio o el costo, vuelve a pasar por RH.
					</p>
				</div>
				{own.length ? (
					<ProductRows products={own} covers={covers} />
				) : (
					<EmptyState
						title='Todavía no ofreces nada'
						body='Publica tu primer producto: RH revisa el precio y en cuanto lo apruebe aparece en el mercado.'
					/>
				)}
			</section>
			<section className='section'>
				<div className='section__head'>
					<h2 className='h3'>Llegan de Custodia</h2>
					<p className='muted'>
						Equipo dado de baja que todavía sirve. A tu empresa le cuesta $0.
					</p>
				</div>
				{fromCustodia.length ? (
					<ProductRows products={fromCustodia} covers={covers} />
				) : (
					<p className='muted'>Nada por ahora.</p>
				)}
			</section>
			<DemoNote>Presupuesto y productos de prueba.</DemoNote>
		</div>
	)
}
