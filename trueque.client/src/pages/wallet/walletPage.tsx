import { Link } from 'react-router'

import { EmptyState, ErrorState } from '@/components/ui/stateViews'
import { Henhouse } from '@/components/wallet/henhouse'
import { MovesFilter, MovesList } from '@/components/wallet/movesList'
import { WalletHero } from '@/components/wallet/walletHero'
import { WalletMonthsCard } from '@/components/wallet/walletMonthsCard'
import { ROUTES } from '@/constants/routes'
import { useWalletPage } from '@/hooks/wallet/useWalletPage'

export default function WalletPage() {
	const wallet = useWalletPage()
	const { list, shown, totals } = wallet

	const movesContent = wallet.movesError ? (
		<ErrorState
			message={wallet.movesError.message}
			onRetry={wallet.retryMoves}
		/>
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
				<p className='lede'>
					Todo lo que has ganado y cambiado, cacao por cacao.
				</p>
			</header>

			<WalletHero
				balance={wallet.balance}
				earned={totals.earned}
				spent={totals.spent}
				moveCount={list.length}
				expiringSoon={wallet.expiringSoon}
			/>

			{totals.earned > 0 && (
				<section className='wallet-card' aria-labelledby='henhouse-title'>
					<div className='wallet-chart__head'>
						<h2 className='h3' id='henhouse-title'>
							Tu gallinero
						</h2>
						<p className='muted wallet-card__sub'>
							Cada gallina es de dónde te llegan cacaos; cada huevo, un abono.
						</p>
					</div>
					<Henhouse moves={list} />
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
