import { WALLET_CHART_MONTHS } from '@/constants/wallet'

import { type MonthBar, MovesChart } from './moves_chart'

export function WalletMonthsCard({ months }: { months: MonthBar[] }) {
	return (
		<section className='wallet-chart wallet-card' aria-labelledby='chart-title'>
			<div className='wallet-chart__head'>
				<h2 className='h3' id='chart-title'>
					Últimos {WALLET_CHART_MONTHS} meses
				</h2>
				<ul className='wallet-chart__legend' role='list'>
					<li className='is-earn'>Ganados</li>
					<li className='is-spend'>Cambiados</li>
				</ul>
			</div>
			<MovesChart months={months} />
			<table className='sr-only'>
				<caption>Cacaos por mes</caption>
				<thead>
					<tr>
						<th scope='col'>Mes</th>
						<th scope='col'>Ganados</th>
						<th scope='col'>Cambiados</th>
					</tr>
				</thead>
				<tbody>
					{months.map(month => (
						<tr key={month.key}>
							<th scope='row'>{month.label}</th>
							<td>{month.earned}</td>
							<td>{month.spent}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}
