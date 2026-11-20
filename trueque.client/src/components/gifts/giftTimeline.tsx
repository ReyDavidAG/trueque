import { GRANT_EVENTS } from '@/constants/grants'
import type { GrantEvent } from '@/types/grantType'
import { shortDate } from '@/utils/dates'

export function GiftTimeline({ events }: { events: GrantEvent[] }) {
	return (
		<section className='gift-section' aria-labelledby='gift-log-t'>
			<h2 className='h4' id='gift-log-t'>
				Bitácora
			</h2>
			<ol className='gift-log' role='list'>
				{events.map(e => (
					<li key={e.id}>
						<b>
							{e.actorName ? `${e.actorName}: ` : ''}
							{GRANT_EVENTS[e.kind].toLowerCase()}
						</b>
						<small className='muted'>{shortDate(e.createdAt)}</small>
						{e.note && <p className='small'>{e.note}</p>}
					</li>
				))}
			</ol>
		</section>
	)
}
