import { memo } from 'react'

import { Coin } from '@/components/ui/art'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { PRODUCT_STATUS } from '@/constants/stall'
import type { Product } from '@/types/productType'
import { formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

import { ProductRowActions } from './productRowActions'

interface ProductRowProps {
	product: Product
	cover?: string
	index: number
}

const stockLabel = ({
	stock,
	stockLeft,
}: Pick<Product, 'stock' | 'stockLeft'>) =>
	stock == null ? 'Sin límite' : (stockLeft ?? stock)

export const ProductRow = memo(function ProductRow({
	product,
	cover,
	index,
}: ProductRowProps) {
	const [statusLabel, statusClass] = PRODUCT_STATUS[product.status]

	return (
		<li
			className='prow animate-row-in'
			data-stall={product.stall}
			data-status={product.status}
			style={stagger(index)}>
			<span className='prow__art'>
				<Cover art={product.art} src={cover} />
			</span>
			<span className='prow__main'>
				<span className='prow__top'>
					<span className={`pill ${statusClass}`}>{statusLabel}</span>
					<span className='prow__folio num'>{product.folio}</span>
				</span>
				<b className='prow__name'>{product.name}</b>
				<span className='prow__fields'>
					<span>
						<small>Precio</small>
						<span className='num'>
							<Coin />
							{product.price}
						</span>
					</span>
					<span>
						<small>Costo</small>
						<span className='num'>{formatMoney(product.cost)}</span>
					</span>
					<span>
						<small>Existencia</small>
						<span className='num'>{stockLabel(product)}</span>
					</span>
				</span>
			</span>
			{product.reviewNote && (
				<span className='prow__reason'>
					<Icon name='info' />
					RH: {product.reviewNote}
				</span>
			)}
			<span className='prow__actions'>
				<ProductRowActions
					productId={product.id}
					status={product.status}
					editable={product.origin === 'manual'}
				/>
			</span>
		</li>
	)
})
