import { cn } from '@/utils/cn'

export interface BarRow {
	key: string
	label: string
	sub?: string
	value: number
	display: string
	hot?: boolean
}

export function BarList({
	title,
	rows,
	tone,
	note,
	scale,
}: {
	title: string
	rows: BarRow[]
	tone?: 'alt' | 'warm'
	note?: string
	scale?: number
}) {
	const max = scale ?? Math.max(1, ...rows.map(r => r.value))
	return (
		<section className='dash-card'>
			<header>
				<h2 className='h4'>{title}</h2>
			</header>
			{rows.length ? (
				<ul className='bars' role='list'>
					{rows.map(r => (
						<li key={r.key}>
							<span className='bars__label'>
								{r.label}
								{r.sub && <small>{r.sub}</small>}
							</span>
							<span className='bars__track'>
								<span
									className={cn(
										'bars__fill',
										tone && `is-${tone}`,
										r.hot && 'is-hot'
									)}
									style={{ width: `${(r.value / max) * 100}%` }}
								/>
							</span>
							<b className='num'>{r.display}</b>
						</li>
					))}
				</ul>
			) : (
				<p className='muted small'>Todavía no hay datos.</p>
			)}
			{note && <p className='muted small'>{note}</p>}
		</section>
	)
}
