import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { CountUp } from '@/components/ui/count_up'
import { Icon, type IconName } from '@/components/ui/icon'
import { EmptyState, ErrorState } from '@/components/ui/state_views'
import { type MonthBar, MovesChart } from '@/components/wallet/moves_chart'
import { Orchard } from '@/components/wallet/orchard'
import { WalletJar } from '@/components/wallet/wallet_jar'
import { ROUTES } from '@/constants/routes'
import { useBalance, useMovements } from '@/hooks/wallet/use_wallet'
import type { Movement } from '@/types/wallet_type'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

const MONTHS = 6
const FILTERS = [
	['all', 'Todos'],
	['earn', 'Ganados'],
	['spend', 'Cambiados'],
] as const
type Filter = (typeof FILTERS)[number][0]

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`

const buildMonths = (list: Movement[]): MonthBar[] => {
	const latest = list.reduce(
		(m, x) => Math.max(m, new Date(x.createdAt).getTime()),
		Date.now()
	)
	const end = new Date(latest)
	const months = Array.from({ length: MONTHS }, (_, i) => {
		const d = new Date(end.getFullYear(), end.getMonth() - (MONTHS - 1 - i), 1)
		return {
			key: monthKey(d),
			label: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
			earned: 0,
			spent: 0,
		}
	})
	const byKey = new Map(months.map(m => [m.key, m]))
	for (const m of list) {
		const bucket = byKey.get(monthKey(new Date(m.createdAt)))
		if (!bucket) continue
		if (m.amount > 0) bucket.earned += m.amount
		else bucket.spent += -m.amount
	}
	return months
}

const MOVE_ICON: Record<Movement['kind'], IconName> = {
	earn: 'spark',
	spend: 'ticket',
	expire: 'clock',
	refund: 'arrowLeft',
	adjust: 'edit',
}

export default function WalletPage() {
	const balance = useBalance()
	const moves = useMovements()
	const list = useMemo(() => moves.data ?? [], [moves.data])
	const totals = useMemo(
		() => ({
			earned: list.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0),
			spent: -list.filter(m => m.kind === 'spend').reduce((s, m) => s + m.amount, 0),
		}),
		[list]
	)
	const months = useMemo(() => buildMonths(list), [list])
	const [filter, setFilter] = useState<Filter>('all')
	const shown = list.filter(m =>
		filter === 'all' ? true : filter === 'earn' ? m.amount > 0 : m.amount < 0
	)
	const bal = balance.data?.balance ?? 0
	const soon = balance.data?.expiring60d ?? 0

	const stat = (label: string, value: number, icon: IconName, tone: string, i: number) => (
		<div className={cn('wallet-stat', tone)} style={{ '--i': i }}>
			<span className='wallet-stat__icon' aria-hidden='true'>
				<Icon name={icon} />
			</span>
			<dt>{label}</dt>
			<dd className='num'>
				<CountUp to={value} />
			</dd>
		</div>
	)

	return (
		<div className='wrap narrow-wide'>
			<header className='page-head wallet-head'>
				<h1 className='h1'>Mi jícara</h1>
				<p className='lede'>Todo lo que has ganado y cambiado, cacao por cacao.</p>
			</header>

			<section className='wallet-hero' aria-label='Tu saldo'>
				<dl className='wallet-hero__side'>
					{stat('Ganados', totals.earned, 'spark', 'is-earn', 0)}
					{stat('Movimientos', list.length, 'chart', 'is-count', 1)}
				</dl>
				<div className='wallet-hero__center'>
					<WalletJar balance={bal} earned={totals.earned} />
					<p className='wallet-hero__n'>
						<span className='num'>
							<CountUp to={bal} />
						</span>
						<span>{bal === 1 ? 'cacao' : 'cacaos'}</span>
					</p>
					<p className='wallet-hero__hint'>
					{totals.spent > 0
						? 'Lo que cambiaste sale de la jícara · arrástrala para girarla'
						: 'Arrastra la jícara para girarla'}
				</p>
				</div>
				<dl className='wallet-hero__side'>
					{stat('Cambiados', totals.spent, 'ticket', 'is-spend', 2)}
					{stat('Vencen pronto', soon, 'clock', soon ? 'is-soon' : 'is-calm', 3)}
				</dl>
			</section>

			{totals.earned > 0 && (
				<section className='wallet-card' aria-labelledby='orchard-title'>
					<div className='wallet-chart__head'>
						<h2 className='h3' id='orchard-title'>
							Tu huerto de cacao
						</h2>
						<p className='muted wallet-card__sub'>
							Cada árbol es de dónde te llegan cacaos; cada mazorca, un abono.
						</p>
					</div>
					<Orchard moves={list} />
				</section>
			)}

			<section className='wallet-chart wallet-card' aria-labelledby='chart-title'>
				<div className='wallet-chart__head'>
					<h2 className='h3' id='chart-title'>
						Últimos {MONTHS} meses
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
						{months.map(m => (
							<tr key={m.key}>
								<th scope='row'>{m.label}</th>
								<td>{m.earned}</td>
								<td>{m.spent}</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>

			<section className='section'>
				<div className='section__head moves-head'>
					<h2 className='h3'>Movimientos</h2>
					<div className='chip-row' role='radiogroup' aria-label='Filtrar movimientos'>
						{FILTERS.map(([id, label]) => (
							<label key={id} className='chip-radio'>
								<input
									type='radio'
									name='moves-filter'
									checked={filter === id}
									onChange={() => setFilter(id)}
								/>
								<span>{label}</span>
							</label>
						))}
					</div>
				</div>
				{moves.error ? (
					<ErrorState message={moves.error.message} onRetry={() => void moves.refetch()} />
				) : list.length && !shown.length ? (
					<p className='muted moves-empty'>No hay movimientos de este tipo.</p>
				) : shown.length ? (
					<ol key={filter} className='moves' role='list'>
						{shown.map((m, i) => (
							<li
								key={m.id}
								className={cn('move animate-row-in', m.amount < 0 && 'is-spend')}
								style={stagger(i)}>
								<span className='move__icon' aria-hidden='true'>
									<Coin className='move__coin' />
									<Icon name={MOVE_ICON[m.kind]} />
								</span>
								<span className='move__text'>
									{m.label}
									<small>{shortDate(m.createdAt)}</small>
								</span>
								<span className='move__n num'>
									{m.amount > 0 ? '+' : '−'}
									{Math.abs(m.amount)}
								</span>
							</li>
						))}
					</ol>
				) : (
					!moves.isLoading && (
						<EmptyState
							title='Todavía no hay movimientos'
							body='Manda una chispa en Chispa y aquí aparece tu primer abono.'
						/>
					)
				)}
			</section>
			<div className='btn-row wallet-actions'>
				<Link className='btn btn--ghost' to={ROUTES.earn}>
					Cómo gano más
				</Link>
				<Link className='btn btn--grana' to={ROUTES.market}>
					Ir al mercado
				</Link>
			</div>
		</div>
	)
}
