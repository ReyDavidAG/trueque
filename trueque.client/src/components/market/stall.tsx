import { memo } from 'react'
import { Link } from 'react-router'

import { ChalkValue } from '@/components/product/chalkValue'
import { MiniVendor } from '@/components/product/miniVendor'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/priceSign'
import { ROUTES } from '@/constants/routes'
import { useEdits } from '@/hooks/product/useEdits'
import { useIsNew } from '@/hooks/product/useIsNew'
import { photoStamp, useSeenChanges } from '@/hooks/product/useSeenChanges'
import type { Product } from '@/types/productType'
import { cn } from '@/utils/cn'
import type { EditField } from '@/utils/editMarks'
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
	const coverReady = !product.hasImages || Boolean(cover)
	const fresh = useSeenChanges(
		link && coverReady ? `trueque.seen.market.${product.id}` : null,
		{
			name: product.name,
			blurb: product.blurb,
			price: String(product.price),
			look: photoStamp(product.art, cover),
		}
	)
	const edits = useEdits(product.id, 'market', link)
	const isFresh = (field: EditField) => fresh.has(field) || edits.has(field)
	const building = useIsNew(product.id, link)
	const body = (
		<>
			<div className={cn('stall__art', isFresh('look') && 'is-fresh')}>
				<Cover art={product.art} src={cover} className='stall__photo' />
				{isFresh('look') && <MiniVendor className='stall__swapper' />}
			</div>
			<PriceSign
				price={product.price}
				className={cn('stall__sign', isFresh('price') && 'is-fresh')}
			/>
			{isFresh('price') && <span className='stall__fresh'>¡Nuevo precio!</span>}
			<div className='stall__body'>
				{product.origin === 'custodia' && (
					<span className='badge badge--custodia'>
						<Icon name='laptop' />
						De Custodia
					</span>
				)}
				<h3 className='stall__name'>
					<ChalkValue value={product.name} paper fresh={isFresh('name')} />
				</h3>
				<p className='stall__blurb'>
					<ChalkValue value={product.blurb} paper fresh={isFresh('blurb')} />
				</p>
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
			className={cn(
				'stall',
				building ? 'is-building' : 'animate-tile-in',
				cover && 'has-photo'
			)}
			data-stall={product.stall}
			style={stagger(index)}>
			<div className='stall__awning' aria-hidden='true' />
			{building && (
				<>
					<MiniVendor className='stall__builder' />
					<span className='stall__opening'>¡Recién abierto!</span>
				</>
			)}
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
