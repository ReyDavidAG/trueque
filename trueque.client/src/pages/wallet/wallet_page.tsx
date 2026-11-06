import { Link } from 'react-router'

import { EmptyState, ErrorState } from '@/components/ui/state_views'
import { MovesFilter, MovesList } from '@/components/wallet/moves_list'
import { Orchard } from '@/components/wallet/orchard'
import { WalletHero } from '@/components/wallet/wallet_hero'
import { WalletMonthsCard } from '@/components/wallet/wallet_months_card'
import { ROUTES } from '@/constants/routes'
import { useWalletPage } from '@/hooks/wallet/use_wallet_page'

export default function WalletPage() {
	const wallet = useWalletPage()
	const { list, shown, totals } = wallet

	const movesContent = wallet.movesError ? (
		<ErrorState message={wallet.movesError.message} onRetry={wallet.retryMoves} />
	) : list.length && !shown.length ? (
		<p className='muted moves-empty'>No hay movimientos de este tipo.</p>
	) : shown.length ? (
		<MovesList moves={shown} listKey={wallet.filter} />
	) : (
		!wallet.movesLoading && (
			<EmptyState
				title='Todavía no hay movimientos'
				body='Manda una chispa en Chispa y aquí aparece tu primer abono.'
			/>
		)
	)

	return (
		<div className='wrap narrow-wide'>
			<header className='page-head wallet-head'>
				<h1 className='h1'>Mi jícara</h1>
				<p className='lede'>Todo lo que has ganado y cambiado, cacao por cacao.</p>
			</header>

			<WalletHero
				balance={wallet.balance}
				earned={totals.earned}
				spent={totals.spent}
				moveCount={list.length}
				expiringSoon={wallet.expiringSoon}
			/>

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

			<WalletMonthsCard months={wallet.months} />

			<section className='section'>
				<div className='section__head moves-head'>
					<h2 className='h3'>Movimientos</h2>
					<MovesFilter value={wallet.filter} onChange={wallet.setFilter} />
				</div>
				{movesContent}
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
