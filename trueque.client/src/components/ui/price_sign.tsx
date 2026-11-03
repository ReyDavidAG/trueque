import { useSwing } from '@/hooks/ui/use_swing'

import { Coin } from './art'

export function PriceSign({
	price,
	className = '',
}: {
	price: number
	className?: string
}) {
	const ref = useSwing<HTMLSpanElement>()
	return (
		<span ref={ref} className={`sign ${className}`}>
			<span className='sign__string' aria-hidden='true' />
			<span className='sign__board'>
				<Coin className='sign__bean' />
				<span className='sign__n num'>{price}</span>
				<span className='sign__unit'>{price === 1 ? 'cacao' : 'cacaos'}</span>
			</span>
		</span>
	)
}
