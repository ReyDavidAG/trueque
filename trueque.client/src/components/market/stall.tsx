import { memo } from 'react'
import { Link } from 'react-router'

import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import { ROUTES } from '@/constants/routes'
import { stallOf } from '@/constants/stall'
import type { Product } from '@/types/product_type'
import { stagger } from '@/utils/stagger'

import { Reach } from './reach'

export const Stall = memo(function Stall({
	product,
	balance,
	index,
}: {
	product: Product
	balance: number
	index: number
}) {
	const left = product.stockLeft
	return (
		<article
			className='stall animate-tile-in'
			data-stall={stallOf(product.art)}
			style={stagger(index)}>
			<div className='stall__awning' aria-hidden='true' />
			<Link className='stall__link' to={ROUTES.product(product.id)}>
				<div className='stall__art'>
					<Art id={product.art} />
				</div>
				<PriceSign price={product.price} className='stall__sign' />
				<div className='stall__body'>
					{product.origin === 'custodia' && (
						<span className='badge badge--custodia'>
							<Icon name='laptop' />
							De Custodia
						</span>
					)}
					<h3 className='stall__name'>{product.name}</h3>
					<p className='stall__blurb'>{product.blurb}</p>
					<div className='stall__foot'>
						<Reach product={product} balance={balance} />
						<span className='stall__meta'>
							{left == null ? 'Sin límite' : left === 0 ? '' : `Quedan ${left}`}
						</span>
					</div>
				</div>
			</Link>
		</article>
	)
})
