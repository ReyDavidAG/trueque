import { memo, useState } from 'react'

import { Coin } from '@/components/ui/art'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { PRODUCT_STATUS } from '@/constants/stall'
import type { Product } from '@/types/product_type'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

import { ProductRowActions, type RowEffect } from './product_row_actions'

interface ProductRowProps {
	product: Product
	cover?: string
	index: number
}

const stockLabel = ({ stock, stockLeft }: Pick<Product, 'stock' | 'stockLeft'>) =>
	stock == null ? 'Sin límite' : (stockLeft ?? stock)

export const ProductRow = memo(function ProductRow({ product, cover, index }: ProductRowProps) {
	const [effect, setEffect] = useState<RowEffect>(null)
	const [statusLabel, statusClass] = PRODUCT_STATUS[product.status]

	return (
		<li
			className={cn('prow animate-row-in', effect && `is-${effect}`)}
			data-stall={product.stall}
			data-status={product.status}
			inert={effect !== null}
			style={stagger(index)}>
			<span className='prow__lid' aria-hidden='true'>
				<i />
				<i />
				<b className='prow__seam' />
			</span>
			<svg className='prow__knife' viewBox='0 0 24 64' aria-hidden='true'>
				<path className='prow__blade' d='M8 2l8 8v10H8z' />
				<rect className='prow__grip' x='5' y='18' width='14' height='44' rx='4' />
				<path className='prow__ridge' d='M9 28h6M9 36h6M9 44h6M9 52h6' />
			</svg>
			<span className='prow__art'>
				<span className='prow__cover'>
					<Cover art={product.art} src={cover} />
				</span>
			</span>
			<span className='prow__main'>
				<span className='prow__label-head'>
					<span>Envío</span>
					<span className='num'>{product.folio}</span>
				</span>
				<span className='prow__label-body'>
					<span key={product.status} className={`pill prow__pill ${statusClass}`}>
						{statusLabel}
					</span>
					<b className='prow__name'>{product.name}</b>
					<span className='prow__fields'>
						<span>Precio</span>
						<span className='num'>
							<Coin />
							{product.price}
						</span>
						<span>Costo</span>
						<span className='num'>{formatMoney(product.cost)}</span>
						<span>Existencia</span>
						<span className='num'>{stockLabel(product)}</span>
					</span>
					<span className='prow__barcode' aria-hidden='true' />
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
					onEffect={setEffect}
				/>
			</span>
			{product.status === 'paused' && (
				<span className='prow__stamp' aria-hidden='true'>
					En pausa
				</span>
			)}
			<span className='prow__dolly' aria-hidden='true'>
				<i />
				<i />
			</span>
		</li>
	)
})
