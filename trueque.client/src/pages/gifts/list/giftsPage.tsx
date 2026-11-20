import { Link } from 'react-router'

import { FundCard } from '@/components/gifts/fundCard'
import { GiftCard } from '@/components/gifts/giftCard'
import { Icon } from '@/components/ui/icon'
import { DemoNote, EmptyState, ErrorState } from '@/components/ui/stateViews'
import { GRANT_STATUS, GRANT_STATUS_ORDER } from '@/constants/grants'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'
import { useGrantFund, useGrants } from '@/hooks/grants/useGrants'
import LoadingPage from '@/pages/core/loading/loadingPage'

export default function GiftsPage() {
	const session = useRequiredSession()
	const year = new Date().getFullYear()
	const grants = useGrants()
	const fund = useGrantFund(year)
	if (grants.isLoading || fund.isLoading) return <LoadingPage />
	const list = grants.data ?? []

	return (
		<div className='wrap narrow-wide'>
			<header className='page-head'>
				<p className='kicker'>Regalos de yemas</p>
				<h1 className='h1'>Regalos</h1>
				<p className='lede'>
					RH los arma, otra persona los autoriza y la base los entrega en la
					fecha. Cada paso queda en la bitácora.
				</p>
				{session.isHr && (
					<Link className='btn btn--grana' to={ROUTES.newGift}>
						<Icon name='plus' />
						Armar un regalo
					</Link>
				)}
			</header>
			<FundCard
				key={fund.data?.fund ?? 'none'}
				year={year}
				fund={fund.data ?? null}
				canEdit={Boolean(session.canApproveGrants)}
			/>
			{grants.error ? (
				<ErrorState
					message={grants.error.message}
					onRetry={() => void grants.refetch()}
				/>
			) : list.length ? (
				GRANT_STATUS_ORDER.map(status => {
					const group = list.filter(g => g.status === status)
					if (!group.length) return null
					return (
						<section key={status} className='gift-group'>
							<h2 className='h4'>
								{GRANT_STATUS[status][0]}{' '}
								<span className='num muted'>{group.length}</span>
							</h2>
							<ul className='gift-cards' role='list'>
								{group.map(g => (
									<GiftCard key={g.id} grant={g} />
								))}
							</ul>
						</section>
					)
				})
			) : (
				<EmptyState
					art='ticket'
					title='Todavía no hay regalos'
					body={
						session.isHr
							? 'Arma el primero: Navidad, un aniversario o un reconocimiento.'
							: 'Cuando RH mande uno a autorizar, aparecerá aquí.'
					}
				/>
			)}
			<DemoNote>Regalos, fondos y montos de prueba.</DemoNote>
		</div>
	)
}
