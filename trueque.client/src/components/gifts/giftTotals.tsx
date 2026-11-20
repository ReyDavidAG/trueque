import { cacaos, formatMoney } from '@/utils/cacaos'
import { plural } from '@/utils/plural'

interface Props {
	people: number
	yemas: number
	pesos: number
	counting?: boolean
}

export function GiftTotals({ people, yemas, pesos, counting = false }: Props) {
	return (
		<dl className='gift-totals' aria-live='polite'>
			<div>
				<dt>Personas</dt>
				<dd className='num'>
					{counting ? '…' : plural(people, 'persona', 'personas')}
				</dd>
			</div>
			<div>
				<dt>Yemas</dt>
				<dd className='num'>{counting ? '…' : cacaos(yemas)}</dd>
			</div>
			<div>
				<dt>Equivale a</dt>
				<dd className='num'>{counting ? '…' : formatMoney(pesos)}</dd>
			</div>
		</dl>
	)
}
