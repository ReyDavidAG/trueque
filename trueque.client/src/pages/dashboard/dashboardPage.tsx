import { BarList } from '@/components/dashboard/barList'
import { Kpis } from '@/components/dashboard/kpis'
import { MonthChart } from '@/components/dashboard/monthChart'
import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { ErrorState } from '@/components/ui/stateViews'
import { useCacaoValue } from '@/hooks/config/useConfig'
import { useDashboard } from '@/hooks/dashboard/useDashboard'
import { useCompanyMap, useProducts } from '@/hooks/market/useMarket'
import { useBudgets } from '@/hooks/panel/usePanel'
import LoadingPage from '@/pages/core/loading/loadingPage'
import { formatMoney } from '@/utils/cacaos'

export default function DashboardPage() {
	const dash = useDashboard()
	const budgets = useBudgets()
	const products = useProducts()
	const companies = useCompanyMap()
	const cacaoValue = useCacaoValue()
	const year = new Date().getFullYear()
	if (dash.isLoading) return <LoadingPage />
	if (dash.error || !dash.data)
		return (
			<div className='wrap'>
				<ErrorState
					message={dash.error?.message ?? ''}
					onRetry={() => void dash.refetch()}
				/>
			</div>
		)
	const d = dash.data
	const productMap = new Map((products.data ?? []).map(p => [p.id, p]))
	const totalArea = d.areas.reduce((s, a) => s + a.people, 0) || 1
	const totalSource = d.sources.reduce((s, x) => s + x.earned, 0) || 1

	return (
		<div className='wrap'>
			<header className='page-head page-head--row'>
				<div>
					<p className='kicker'>RH y dirección · {year}</p>
					<h1 className='h1'>Cómo va El Trueque</h1>
					<p className='lede'>
						Lo que se ha dado, lo que se ha cambiado y lo que se debe, en cacaos
						y en pesos (1 cacao = {formatMoney(cacaoValue)}).
					</p>
				</div>
				<span className='tag-example'>
					<Icon name='info' />
					Datos de la demostración
				</span>
			</header>
			<Kpis totals={d.totals} cacaoValue={cacaoValue} />
			<div className='dash'>
				<MonthChart months={d.months} />
				<BarList
					title='Presupuesto por empresa'
					scale={100}
					rows={(budgets.data ?? [])
						.filter(b => b.period === year && b.assigned > 0)
						.map(b => {
							const used = b.redeemed + b.committed
							const pct = Math.round((used / b.assigned) * 100)
							return {
								key: b.companyId,
								label: companies.get(b.companyId)?.name ?? '',
								sub: `${formatMoney(used)} de ${formatMoney(b.assigned)}`,
								value: pct,
								display: `${pct}%`,
								hot: pct > 80,
							}
						})}
				/>
				<section className='dash-card'>
					<header>
						<h2 className='h4'>Lo más cambiado</h2>
					</header>
					{d.top.length ? (
						<ol className='top' role='list'>
							{d.top.map((t, i) => {
								const p = productMap.get(t.productId)
								return (
									<li key={t.productId} data-stall={p?.stall}>
										<span className='top__n num'>{i + 1}</span>
										<span className='top__art'>
											<Art id={p?.art ?? 'ticket'} />
										</span>
										<span className='top__name'>
											{p?.name ?? 'Producto retirado'}
											<small>{p ? companies.get(p.companyId)?.name : ''}</small>
										</span>
										<b className='num'>{t.trades}</b>
									</li>
								)
							})}
						</ol>
					) : (
						<p className='muted small'>Todavía no hay trueques.</p>
					)}
				</section>
				<BarList
					title='Quién participa, por área'
					tone='alt'
					rows={d.areas.slice(0, 6).map(a => ({
						key: a.area,
						label: a.area,
						value: a.people,
						display: `${Math.round((a.people / totalArea) * 100)}%`,
					}))}
				/>
				<BarList
					title='De dónde salen los cacaos'
					tone='warm'
					note='Cada fuente nueva (por ejemplo, ahorro validado) es una regla más en Ajustes.'
					rows={d.sources.map(s => ({
						key: s.label,
						label: s.label,
						value: s.earned,
						display: `${Math.round((s.earned / totalSource) * 100)}%`,
					}))}
				/>
			</div>
		</div>
	)
}
