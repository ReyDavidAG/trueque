import { memo } from 'react'
import { Link } from 'react-router'

import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import { ROUTES } from '@/constants/routes'
import type { Product } from '@/types/product_type'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

import { Reach } from './reach'

interface Props {
	product: Product
	balance: number
	index: number
	cover?: string
	companyName: string
	link?: boolean
}

export const Stall = memo(function Stall({
	product,
	balance,
	index,
	cover,
	companyName,
	link = true,
}: Props) {
	const left = product.stockLeft
	const body = (
		<>
			<div className='stall__art'>
				<Cover art={product.art} src={cover} className='stall__photo' />
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
				<p className='stall__by'>
					<Icon name='building' />
					{companyName}
				</p>
				<div className='stall__foot'>
					<Reach product={product} balance={balance} />
					<span className='stall__meta'>
						{left == null ? 'Sin límite' : left === 0 ? '' : `Quedan ${left}`}
					</span>
				</div>
			</div>
		</>
	)
	return (
		<article
			className={cn('stall animate-tile-in', cover && 'has-photo')}
			data-stall={product.stall}
			style={stagger(index)}>
			<div className='stall__awning' aria-hidden='true' />
			{link ? (
				<Link className='stall__link' to={ROUTES.product(product.id)}>
					{body}
				</Link>
			) : (
				<div className='stall__link'>{body}</div>
			)}
		</article>
	)
})
