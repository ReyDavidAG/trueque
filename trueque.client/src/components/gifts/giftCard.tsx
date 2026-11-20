import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { GRANT_STATUS } from '@/constants/grants'
import { ROUTES } from '@/constants/routes'
import type { Grant } from '@/types/grantType'
import { cacaos } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { plural } from '@/utils/plural'

export function GiftCard({ grant }: { grant: Grant }) {
	const [label, tone] = GRANT_STATUS[grant.status]
	return (
		<li>
			<Link className='gift-card' to={ROUTES.gift(grant.id)}>
				<span className='gift-card__icon' aria-hidden='true'>
					<Icon name='gift' />
				</span>
				<span className='gift-card__body'>
					<b>{grant.name}</b>
					<small className='muted'>
						<span className='num'>{grant.folio}</span> · {grant.occasionName} ·{' '}
						{grant.scopeName} · entrega {shortDate(grant.deliverOn)}
					</small>
				</span>
				<span className='gift-card__end'>
					<span className={cn('pill', tone)}>{label}</span>
					{grant.people > 0 && (
						<small className='num muted'>
							{plural(grant.people, 'persona', 'personas')} ·{' '}
							{cacaos(grant.total)}
						</small>
					)}
				</span>
			</Link>
		</li>
	)
}
