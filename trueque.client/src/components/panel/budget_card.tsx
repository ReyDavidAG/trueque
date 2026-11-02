import type { Budget } from '@/types/panel_type'

const pct = (n: number, total: number) =>
	`${total ? Math.min(100, Math.round((n / total) * 100)) : 0}%`

export function BudgetCard({
	budget,
	companyName,
}: {
	budget: Budget
	companyName: string
}) {
	return (
		<section className='budget'>
			<div className='budget__head'>
				<h2 className='h4'>
					Presupuesto {budget.period} · {companyName}
				</h2>
				<span className='tag-example'>Prueba</span>
			</div>
			<div
				className='budget__bar'
				role='img'
				aria-label={`Canjeado ${budget.redeemed}, en cupones vigentes ${budget.committed}, libre ${budget.available} de ${budget.assigned} cacaos`}>
				<span
					className='is-redeemed'
					style={{ width: pct(budget.redeemed, budget.assigned) }}
				/>
				<span
					className='is-committed'
					style={{ width: pct(budget.committed, budget.assigned) }}
				/>
			</div>
			<dl className='budget__legend'>
				<div>
					<dt>
						<i className='is-redeemed' />
						Canjeado
					</dt>
					<dd className='num'>{budget.redeemed.toLocaleString('es-MX')}</dd>
				</div>
				<div>
					<dt>
						<i className='is-committed' />
						En cupones vigentes
					</dt>
					<dd className='num'>{budget.committed.toLocaleString('es-MX')}</dd>
				</div>
				<div>
					<dt>
						<i />
						Libre
					</dt>
					<dd className='num'>{budget.available.toLocaleString('es-MX')}</dd>
				</div>
			</dl>
		</section>
	)
}
