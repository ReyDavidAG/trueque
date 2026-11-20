import type { GrantForm } from '@/schemas/grants/grant.schema'
import { shortDate } from '@/utils/dates'

import { GiftTotals } from './giftTotals'

interface Props {
	values: GrantForm
	occasionName: string
	scopeName: string
	totals: { people: number; yemas: number; pesos: number; counting: boolean }
}

export function GiftStepReview({
	values,
	occasionName,
	scopeName,
	totals,
}: Props) {
	return (
		<>
			<dl className='gift-summary'>
				<div>
					<dt>Ocasión</dt>
					<dd>{occasionName}</dd>
				</div>
				<div>
					<dt>Nombre</dt>
					<dd>{values.name}</dd>
				</div>
				<div>
					<dt>Por qué</dt>
					<dd>{values.reason}</dd>
				</div>
				<div>
					<dt>A quién</dt>
					<dd>{scopeName}</dd>
				</div>
				<div>
					<dt>Entrega</dt>
					<dd>{values.deliverOn ? shortDate(values.deliverOn) : '—'}</dd>
				</div>
				<div>
					<dt>Vencen en</dt>
					<dd>{values.lotMonths} meses</dd>
				</div>
			</dl>
			<GiftTotals {...totals} />
			<p className='muted small'>
				Al mandarlo, la lista se congela y la base revisa los topes. Otra
				persona lo autoriza; tú no puedes.
			</p>
		</>
	)
}
