import { Icon, type IconName } from '@/components/ui/icon'
import type { DashboardData } from '@/types/config_type'
import { formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

const fmt = (n: number) => n.toLocaleString('es-MX')

export function Kpis({
	totals: t,
	cacaoValue,
}: {
	totals: DashboardData['totals']
	cacaoValue: number
}) {
	const items: [IconName, string, string, string][] = [
		[
			'spark',
			'Cacaos dados',
			fmt(t.earned),
			`${formatMoney(t.earned * cacaoValue)} en especie`,
		],
		[
			'ticket',
			'Cacaos cambiados',
			fmt(t.spent),
			t.earned
				? `${Math.round((t.spent / t.earned) * 100)}% de lo dado`
				: 'Todavía nada',
		],
		[
			'coins',
			'Sin cambiar',
			fmt(t.outstanding),
			`La empresa debe ${formatMoney(t.outstanding * cacaoValue)}`,
		],
		[
			'clock',
			'Vencen este mes',
			fmt(t.expiringThisMonth),
			'Se avisa a cada persona',
		],
		[
			'users',
			'Personas que ganaron',
			fmt(t.activePeople),
			t.totalPeople
				? `${Math.round((t.activePeople / t.totalPeople) * 100)}% de ${fmt(t.totalPeople)}`
				: '',
		],
	]
	return (
		<dl className='kpis'>
			{items.map(([ic, k, v, note], i) => (
				<div key={k} className='kpi animate-tile-in' style={stagger(i)}>
					<dt>
						<Icon name={ic} />
						{k}
					</dt>
					<dd className='num'>{v}</dd>
					<dd className='kpi__note'>{note}</dd>
				</div>
			))}
		</dl>
	)
}
