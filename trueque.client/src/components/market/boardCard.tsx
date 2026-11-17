import { memo } from 'react'
import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { Cover } from '@/components/ui/cover'
import { ROUTES } from '@/constants/routes'
import type { Product } from '@/types/productType'
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

export const BoardCard = memo(function BoardCard({
	product,
	balance,
	index,
	cover,
	companyName,
	link = true,
}: Props) {
	const left = product.stockLeft
	const content = (
		<>
			<div
				className='bcard__pic'
				style={cover ? { '--photo': `url("${cover}")` } : undefined}>
				<Cover art={product.art} src={cover} className='bcard__photo' />
			</div>
			<div className='bcard__body'>
				<span className='bcard__by'>
					{companyName}
					{product.origin === 'custodia' && ' · De Custodia'}
				</span>
				<h3 className='bcard__name'>{product.name}</h3>
				<p className='bcard__blurb'>{product.blurb}</p>
				{left != null && left > 0 && (
					<span className='bcard__meta num'>Quedan {left}</span>
				)}
				<div className='bcard__foot'>
					<span className='bcard__price'>
						<Coin className='bcard__coin' />
						<b className='num'>{product.price}</b>
						<small>{product.price === 1 ? 'yema' : 'yemas'}</small>
					</span>
					{link && <Reach product={product} balance={balance} />}
				</div>
			</div>
		</>
	)
	return (
		<article
			className='bcard animate-tile-in'
			data-stall={product.stall}
			style={stagger(index)}>
			{link ? (
				<Link className='bcard__link' to={ROUTES.product(product.id)}>
					{content}
				</Link>
			) : (
				<div className='bcard__link'>{content}</div>
			)}
		</article>
	)
})
