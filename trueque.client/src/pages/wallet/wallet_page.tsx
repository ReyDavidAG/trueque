import { useMemo } from 'react'
import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { CountUp } from '@/components/ui/count_up'
import { Icon } from '@/components/ui/icon'
import { EmptyState, ErrorState } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useBalance, useMovements } from '@/hooks/wallet/use_wallet'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

export default function WalletPage() {
	const balance = useBalance()
	const moves = useMovements()
	const totals = useMemo(() => {
		const list = moves.data ?? []
		return {
			earned: list.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0),
			spent: -list
				.filter(m => m.kind === 'spend')
				.reduce((s, m) => s + m.amount, 0),
		}
	}, [moves.data])
	const bal = balance.data?.balance ?? 0
	const soon = balance.data?.expiring60d ?? 0

	return (
		<div className='wrap narrow'>
			<header className='page-head'>
				<h1 className='h1'>Mi jícara</h1>
				<p className='lede'>
					Todo lo que has ganado y cambiado, cacao por cacao.
				</p>
			</header>
			<section className='wallet'>
				<div className='wallet__coins' aria-hidden='true'>
					<Coin className='wallet__coin is-back' />
					<Coin className='wallet__coin' />
				</div>
				<p className='wallet__n'>
					<span className='num'>
						<CountUp to={bal} />
					</span>
					<span>{bal === 1 ? 'cacao' : 'cacaos'}</span>
				</p>
				<dl className='wallet__stats'>
					<div>
						<dt>Ganados</dt>
						<dd className='num'>{totals.earned}</dd>
					</div>
					<div>
						<dt>Cambiados</dt>
						<dd className='num'>{totals.spent}</dd>
					</div>
					<div className={cn(soon && 'is-soon')}>
						<dt>Vencen pronto</dt>
						<dd className='num'>{soon}</dd>
					</div>
				</dl>
			</section>
			<section className='section'>
				<div className='section__head'>
					<h2 className='h3'>Movimientos</h2>
				</div>
				{moves.error ? (
					<ErrorState
						message={moves.error.message}
						onRetry={() => void moves.refetch()}
					/>
				) : moves.data?.length ? (
					<ol className='moves' role='list'>
						{moves.data.map((m, i) => (
							<li
								key={m.id}
								className={cn(
									'move animate-row-in',
									m.amount < 0 && 'is-spend'
								)}
								style={stagger(i)}>
								<span className='move__icon' aria-hidden='true'>
									<Icon name={m.amount < 0 ? 'ticket' : 'spark'} />
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
			<div className='btn-row'>
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
