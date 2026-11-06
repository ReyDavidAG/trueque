import type { OrchardTip as Tip } from '@/types/orchard_type'
import { shortDate } from '@/utils/dates'
import { movementReference, movementSource } from '@/utils/movement_label'

export function OrchardTip({ tip }: { tip: Tip }) {
	const reference = movementReference(tip.move)
	return (
		<div className='orchard__tip' style={{ left: tip.x, top: tip.y }} role='status'>
			<b className='num'>+{tip.part} cacaos</b>
			<span>{movementSource(tip.move)}</span>
			{reference && <span className='num'>{reference}</span>}
			<small>
				{tip.count > 1
					? `Mazorca ${tip.index} de ${tip.count} · abono de ${tip.move.amount}`
					: 'Abono completo'}{' '}
				· {shortDate(tip.move.createdAt)}
			</small>
		</div>
	)
}
