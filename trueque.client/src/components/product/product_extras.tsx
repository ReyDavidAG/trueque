import { Icon } from '@/components/ui/icon'
import type { ExchangeLocation } from '@/types/product_type'

export function Pickup({ location }: { location?: ExchangeLocation }) {
	const note = location?.reference ?? location?.address
	return (
		<p className='pickup'>
			<span className='pickup__kicker'>
				<Icon name='pin' />
				Se recoge en
			</span>
			<b>{location?.name ?? 'Por confirmar'}</b>
			{note && <small>{note}</small>}
		</p>
	)
}
