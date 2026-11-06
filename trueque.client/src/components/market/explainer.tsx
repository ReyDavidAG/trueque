import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { useExplainer } from '@/hooks/market/useExplainer'
import { useExplainerSlides } from '@/hooks/market/useExplainerSlides'
import type { Product } from '@/types/productType'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

import { ExplainerTour } from './explainerTour'

export function Explainer({ products }: { products: Product[] }) {
	const { slides, cacaoValue } = useExplainerSlides(products)
	const tour = useExplainer(slides.length)

	return (
		<section
			className={cn(
				'explainer',
				tour.visible && 'is-open',
				tour.open && !tour.visible && 'is-closing'
			)}
			aria-labelledby='explainer-title'>
			<button
				className='explainer__head'
				type='button'
				aria-expanded={tour.visible}
				aria-controls='explainer-body'
				onClick={tour.toggle}>
				<Coin className='explainer__coin' />
				<span>
					<b className='explainer__title' id='explainer-title'>
						¿Qué es un cacao?
					</b>
					<span className='explainer__value'>
						1 cacao vale <b className='num'>{formatMoney(cacaoValue)}</b> en
						productos
					</span>
				</span>
				<Icon name='chevronDown' className='explainer__chev' />
			</button>
			{tour.open && <ExplainerTour slides={slides} tour={tour} />}
		</section>
	)
}
