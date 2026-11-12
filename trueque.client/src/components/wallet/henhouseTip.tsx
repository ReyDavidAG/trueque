import type { HenhouseTip as Tip } from '@/types/henhouseType'
import { shortDate } from '@/utils/dates'
import { movementReference, movementSource } from '@/utils/movementLabel'

export function HenhouseTip({ tip }: { tip: Tip }) {
	const reference = movementReference(tip.move)
	return (
		<div
			className='henhouse__tip'
			style={{ left: tip.x, top: tip.y }}
			role='status'>
			<b className='num'>+{tip.part} cacaos</b>
			<span>{movementSource(tip.move)}</span>
			{reference && <span className='num'>{reference}</span>}
			<small>
				{tip.count > 1
					? `Huevo ${tip.index} de ${tip.count} · abono de ${tip.move.amount}`
					: 'Abono completo'}{' '}
				· {shortDate(tip.move.createdAt)}
			</small>
		</div>
	)
}
