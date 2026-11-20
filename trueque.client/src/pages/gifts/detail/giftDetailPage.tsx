import { Link, useParams } from 'react-router'

import { GiftActions } from '@/components/gifts/giftActions'
import { GiftRecipients } from '@/components/gifts/giftRecipients'
import { GiftTimeline } from '@/components/gifts/giftTimeline'
import { GiftTotals } from '@/components/gifts/giftTotals'
import { Icon } from '@/components/ui/icon'
import { GRANT_STATUS } from '@/constants/grants'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'
import { useCacaoValue } from '@/hooks/config/useConfig'
import {
	useGrant,
	useGrantEvents,
	useGrantRecipients,
} from '@/hooks/grants/useGrants'
import LoadingPage from '@/pages/core/loading/loadingPage'
import NotFoundPage from '@/pages/core/not_found/notFoundPage'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

export default function GiftDetailPage() {
	const { id = '' } = useParams()
	const session = useRequiredSession()
	const cacaoValue = useCacaoValue()
	const grant = useGrant(id)
	const recipients = useGrantRecipients(id)
	const events = useGrantEvents(id)
	if (grant.isLoading || recipients.isLoading || events.isLoading)
		return <LoadingPage />
	const g = grant.data
	if (!g) return <NotFoundPage />
	const [label, tone] = GRANT_STATUS[g.status]
	const people = recipients.data ?? []
	const frozen = g.status !== 'draft' && g.status !== 'rejected'

	return (
		<div className='wrap narrow-wide'>
			<Link className='back-link' to={ROUTES.gifts}>
				<Icon name='arrowLeft' />
				Regalos
			</Link>
			<header className='page-head'>
				<p className='kicker'>
					<span className='num'>{g.folio}</span> · {g.occasionName}
				</p>
				<h1 className='h1'>{g.name}</h1>
				<p className='lede'>{g.reason}</p>
				<span className={cn('pill', tone)}>{label}</span>
			</header>
			<dl className='gift-summary'>
				<div>
					<dt>A quién</dt>
					<dd>{g.scopeName}</dd>
				</div>
				<div>
					<dt>Entrega</dt>
					<dd>{shortDate(g.deliverOn)}</dd>
				</div>
				<div>
					<dt>Vencen en</dt>
					<dd>{g.lotMonths} meses</dd>
				</div>
				<div>
					<dt>Lo armó</dt>
					<dd>{g.createdByName}</dd>
				</div>
				{g.decidedByName && (
					<div>
						<dt>{g.status === 'rejected' ? 'Lo rechazó' : 'Lo autorizó'}</dt>
						<dd>
							{g.decidedByName}
							{g.decisionNote && ` · ${g.decisionNote}`}
						</dd>
					</div>
				)}
				{g.cancelNote && (
					<div>
						<dt>Cancelado</dt>
						<dd>{g.cancelNote}</dd>
					</div>
				)}
			</dl>
			{g.people > 0 && (
				<GiftTotals
					people={g.people}
					yemas={g.total}
					pesos={g.total * cacaoValue}
				/>
			)}
			<GiftActions
				grant={g}
				isHr={session.isHr}
				canApprove={Boolean(session.canApproveGrants)}
				personId={session.person.id}
				inList={
					g.scope === 'list' &&
					people.some(p => p.personId === session.person.id)
				}
			/>
			<GiftRecipients recipients={people} frozen={frozen} />
			<GiftTimeline events={events.data ?? []} />
		</div>
	)
}
