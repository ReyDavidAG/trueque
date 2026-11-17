import { Link } from 'react-router'

import { EmptyState, ErrorState } from '@/components/ui/stateViews'
import { Coop } from '@/components/wallet/coop'
import { MovesList } from '@/components/wallet/movesList'
import { WalletCard } from '@/components/wallet/walletCard'
import { ROUTES } from '@/constants/routes'
import { useWalletPage } from '@/hooks/wallet/useWalletPage'

export default function WalletPage() {
	const wallet = useWalletPage()
	const { list, totals } = wallet

	const movesContent = wallet.movesError ? (
		<ErrorState
			message={wallet.movesError.message}
			onRetry={wallet.retryMoves}
		/>
	) : list.length ? (
		<MovesList moves={list} />
	) : (
		!wallet.movesLoading && (
			<EmptyState
				title='Todavía no hay movimientos'
				body='Manda una chispa en Chispa y aquí aparece tu primera yema.'
			/>
		)
	)

	return (
		<div className='wrap wallet-page'>
			<header className='page-head'>
				<h1 className='h1'>Mis yemas</h1>
				<p className='lede'>
					Todo lo que has ganado y cambiado, yema por yema.
				</p>
			</header>

			<div className='wallet-top'>
				<WalletCard
					balance={wallet.balance}
					earned={totals.earned}
					spent={totals.spent}
					expiringSoon={wallet.expiringSoon}
				/>

				<Coop moves={list} />
			</div>

			<section className='section wallet-moves'>
				<div className='section__head'>
					<h2 className='h3'>Movimientos</h2>
				</div>
				{movesContent}
			</section>
			<div className='btn-row'>
				<Link className='btn btn--ghost' to={ROUTES.earn}>
					Cómo gano más
				</Link>
				<Link className='btn btn--grana' to={ROUTES.market}>
					Ir a la despensa
				</Link>
			</div>
		</div>
	)
}
