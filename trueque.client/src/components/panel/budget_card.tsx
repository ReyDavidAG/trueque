import { Icon } from '@/components/ui/icon'
import type { Budget } from '@/types/panel_type'
import { formatMoney } from '@/utils/cacaos'

export function BudgetCard({
	budget,
	companyName,
}: {
	budget: Budget
	companyName?: string
}) {
	const free = Math.max(0, budget.available)
	const pct = (n: number) =>
		`${budget.assigned ? Math.min(100, (n / budget.assigned) * 100).toFixed(1) : 0}%`
	return (
		<section className='budget'>
			<div className='budget__head'>
				<h2 className='h4'>
					Presupuesto {budget.period}
					{companyName && ` · ${companyName}`}
				</h2>
				<span className='tag-example'>Prueba</span>
			</div>
			<p className='budget__total'>
				<b className='num'>{formatMoney(free)}</b> libres de{' '}
				{formatMoney(budget.assigned)}
			</p>
			<div
				className='budget__bar'
				role='img'
				aria-label={`Canjeado ${formatMoney(budget.redeemed)}, en cupones vigentes ${formatMoney(budget.committed)}, libre ${formatMoney(free)}`}>
				<span className='is-redeemed' style={{ width: pct(budget.redeemed) }} />
				<span
					className='is-committed'
					style={{ width: pct(budget.committed) }}
				/>
			</div>
			<dl className='budget__legend'>
				<div>
					<dt>
						<i className='is-redeemed' />
						Canjeado
					</dt>
					<dd className='num'>{formatMoney(budget.redeemed)}</dd>
				</div>
				<div>
					<dt>
						<i className='is-committed' />
						En cupones vigentes
					</dt>
					<dd className='num'>{formatMoney(budget.committed)}</dd>
				</div>
				<div>
					<dt>
						<i />
						Libre
					</dt>
					<dd className='num'>{formatMoney(free)}</dd>
				</div>
			</dl>
			<p className='budget__note'>
				<Icon name='info' />
				Cada canje de tus productos se descuenta con su costo real en pesos.
			</p>
		</section>
	)
}
