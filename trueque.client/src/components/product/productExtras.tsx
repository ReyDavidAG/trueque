import { Icon } from '@/components/ui/icon'
import type { ExchangeLocation } from '@/types/productType'

import { ChalkValue } from './chalkValue'

export function Pickup({
	location,
	fresh = false,
}: {
	location?: ExchangeLocation
	fresh?: boolean
}) {
	const note = location?.reference ?? location?.address
	return (
		<p className='pickup'>
			<span className='pickup__kicker'>
				<Icon name='pin' />
				Se recoge en
			</span>
			<b>
				<ChalkValue
					value={location?.name ?? 'Por confirmar'}
					paper
					fresh={fresh}
				/>
			</b>
			{note && <small>{note}</small>}
		</p>
	)
}
