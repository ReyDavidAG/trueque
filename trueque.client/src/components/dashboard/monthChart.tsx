import type { DashboardData } from '@/types/configType'

const MONTHS = [
	'ene',
	'feb',
	'mar',
	'abr',
	'may',
	'jun',
	'jul',
	'ago',
	'sep',
	'oct',
	'nov',
	'dic',
]

function lastSix(rows: DashboardData['months']) {
	const now = new Date()
	return Array.from({ length: 6 }, (_, i) => {
		const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
		const row = rows.find(r => r.month.startsWith(key))
		return {
			label: MONTHS[d.getMonth()],
			earned: row?.earned ?? 0,
			spent: row?.spent ?? 0,
		}
	})
}

export function MonthChart({ months }: { months: DashboardData['months'] }) {
	const data = lastSix(months)
	const max = Math.max(1, ...data.flatMap(d => [d.earned, d.spent]))
	const W = 760
	const H = 230
	const pad = 28
	const step = (W - pad * 2) / data.length
	const bw = step * 0.3
	const y = (v: number) => H - pad - (v / max) * (H - pad * 2)
	return (
		<section className='dash-card dash-card--wide'>
			<header>
				<h2 className='h4'>Cacaos por mes</h2>
				<ul className='legend' role='list'>
					<li>
						<i className='is-earned' />
						Dados
					</li>
					<li>
						<i className='is-spent' />
						Cambiados
					</li>
				</ul>
			</header>
			<svg
				className='chart'
				viewBox={`0 0 ${W} ${H}`}
				role='img'
				aria-label='Cacaos dados y cambiados en los últimos seis meses'>
				<path className='chart__base' d={`M${pad} ${H - pad}H${W - pad}`} />
				{data.map((d, i) => {
					const x = pad + i * step + step * 0.18
					return (
						<g key={d.label}>
							<rect
								className='bar bar--earned'
								x={x}
								y={y(d.earned)}
								width={bw}
								height={H - pad - y(d.earned)}
								rx={4}>
								<title>{`${d.label}: ${d.earned} dados`}</title>
							</rect>
							<rect
								className='bar bar--spent'
								x={x + bw + 4}
								y={y(d.spent)}
								width={bw}
								height={H - pad - y(d.spent)}
								rx={4}>
								<title>{`${d.label}: ${d.spent} cambiados`}</title>
							</rect>
							<text
								className='chart__x'
								x={x + bw + 2}
								y={H - 8}
								textAnchor='middle'>
								{d.label}
							</text>
						</g>
					)
				})}
			</svg>
			<table className='sr-only'>
				<caption>Cacaos por mes</caption>
				<tbody>
					{data.map(d => (
						<tr key={d.label}>
							<td>{d.label}</td>
							<td>{d.earned}</td>
							<td>{d.spent}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}
