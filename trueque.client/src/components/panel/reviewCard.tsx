import { useState } from 'react'
import { toast } from 'sonner'

import { Art, Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { useReviewPrice } from '@/hooks/panel/usePanel'
import type { CategoryInfo, Product } from '@/types/productType'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

function RangeBar({ price, range }: { price: number; range: CategoryInfo }) {
	const max = Math.max(range.priceMax, price) * 1.3
	const x = (n: number) => `${(n / max) * 100}%`
	const out = price < range.priceMin || price > range.priceMax
	return (
		<>
			<div
				className={cn('range', out && 'is-out')}
				role='img'
				aria-label={`Precio ${price}, rango de referencia ${range.priceMin} a ${range.priceMax}`}>
				<span
					className='range__band'
					style={{
						left: x(range.priceMin),
						width: `calc(${x(range.priceMax)} - ${x(range.priceMin)})`,
					}}
				/>
				<span className='range__dot' style={{ left: x(price) }} />
			</div>
			<p className='range__label'>
				{out && <Icon name='info' />}
				{out ? 'Fuera' : 'Dentro'} del rango de referencia ({range.priceMin}–
				{range.priceMax})
			</p>
		</>
	)
}

export function ReviewCard({
	product,
	range,
	companyName,
	index,
}: {
	product: Product
	range?: CategoryInfo
	companyName: string
	index: number
}) {
	const review = useReviewPrice()
	const [note, setNote] = useState('')
	const target = range
		? Math.min(Math.max(product.price, range.priceMin), range.priceMax)
		: product.price
	const decide = (decision: 'approved' | 'adjusted' | 'rejected') =>
		review.mutate(
			{
				productId: product.id,
				decision,
				finalPrice: decision === 'adjusted' ? target : null,
				note: note.trim() || null,
			},
			{
				onSuccess: () =>
					toast.success(
						decision === 'rejected'
							? 'Rechazado; la empresa ve tu nota'
							: 'Listo, el producto se publica en el mercado'
					),
				onError: e => toast.error(e.message),
			}
		)

	return (
		<article className='approval animate-tile-in' style={stagger(index)}>
			<div className='approval__art'>
				<Art id={product.art} />
			</div>
			<div className='approval__body'>
				<span className='muted small'>
					{companyName}
					{product.origin === 'custodia' &&
						` · de Custodia ${product.originRef}`}
				</span>
				<h2 className='h4'>{product.name}</h2>
				<p className='approval__price'>
					<Coin />
					<b className='num'>{product.price}</b> propuestos
				</p>
				{range && <RangeBar price={product.price} range={range} />}
				<label className='sr-only' htmlFor={`note-${product.id}`}>
					Nota para la empresa
				</label>
				<input
					id={`note-${product.id}`}
					className='input'
					maxLength={140}
					placeholder='Nota para la empresa (opcional)'
					value={note}
					onChange={e => setNote(e.target.value)}
				/>
				<div className='approval__actions'>
					<button
						className='btn btn--grana btn--sm'
						type='button'
						disabled={review.isPending}
						onClick={() => decide('approved')}>
						Aprobar
					</button>
					{target !== product.price && (
						<button
							className='btn btn--sm'
							type='button'
							disabled={review.isPending}
							onClick={() => decide('adjusted')}>
							Ajustar a {target}
						</button>
					)}
					<button
						className='btn btn--ghost btn--sm'
						type='button'
						disabled={review.isPending}
						onClick={() => decide('rejected')}>
						Rechazar
					</button>
				</div>
			</div>
		</article>
	)
}
