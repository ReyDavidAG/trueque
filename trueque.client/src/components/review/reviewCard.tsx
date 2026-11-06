import { memo, useState } from 'react'
import { toast } from 'sonner'

import { Coin } from '@/components/ui/art'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { useReviewPrice } from '@/hooks/panel/usePanel'
import type { CategoryInfo, Product } from '@/types/productType'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

import { PriceSlider } from './priceSlider'
import { ReviewNote } from './reviewNote'

interface Props {
	product: Product
	range: CategoryInfo
	companyName: string
	cover?: string
	cacaoValue: number
	index: number
}

export const ReviewCard = memo(function ReviewCard({
	product: p,
	range,
	companyName,
	cover,
	cacaoValue,
	index,
}: Props) {
	const review = useReviewPrice()
	const suggested = p.cost
		? Math.max(1, Math.round(p.cost / cacaoValue))
		: p.price
	const [value, setValue] = useState(p.price)
	const [rejecting, setRejecting] = useState(false)
	const [note, setNote] = useState('')
	const [error, setError] = useState<string | null>(null)
	const out = value < range.priceMin || value > range.priceMax
	const changed = value !== p.price
	const needNote = changed || rejecting

	const decide = (decision: 'approved' | 'adjusted' | 'rejected') => {
		if (decision !== 'approved' && note.trim().length < 10)
			return setError(
				'Escribe el motivo: la empresa lo necesita para corregir.'
			)
		review.mutate(
			{
				productId: p.id,
				decision,
				finalPrice: decision === 'adjusted' ? value : null,
				note: note.trim() || null,
			},
			{
				onSuccess: () =>
					toast.success(
						decision === 'rejected'
							? 'Rechazado; la empresa ve tu motivo'
							: decision === 'adjusted'
								? `Ajustado a ${cacaos(value)} y publicado`
								: `Aprobado: ${p.name} ya está en el mercado`
					),
				onError: e => toast.error(e.message),
			}
		)
	}

	return (
		<article
			className='approval animate-tile-in'
			data-stall={p.stall}
			style={stagger(index)}>
			<div className='approval__art'>
				<Cover art={p.art} src={cover} />
			</div>
			<div className='approval__body'>
				<span className='muted small'>
					{companyName}
					{p.origin === 'custodia' && ` · de Custodia ${p.originRef ?? ''}`}
				</span>
				<h2 className='h4'>{p.name}</h2>
				<dl className='approval__nums'>
					<div>
						<dt>Propone</dt>
						<dd className='num'>
							<Coin />
							{p.price}
						</dd>
					</div>
					<div>
						<dt>Costo</dt>
						<dd className='num'>{formatMoney(p.cost)}</dd>
					</div>
					<div>
						<dt>Sugerido</dt>
						<dd className='num'>
							<Coin />
							{suggested}
						</dd>
					</div>
				</dl>
				<PriceSlider
					id={p.id}
					name={p.name}
					proposed={p.price}
					suggested={suggested}
					value={value}
					range={range}
					cacaoValue={cacaoValue}
					onChange={setValue}
				/>
				<div className='approval__actions'>
					<button
						className='btn btn--grana btn--sm'
						type='button'
						disabled={out || review.isPending}
						onClick={() => decide(changed ? 'adjusted' : 'approved')}>
						{!out && <Icon name='check' />}
						{out
							? 'Fuera de rango'
							: changed
								? `Ajustar a ${value} y publicar`
								: `Aprobar ${p.price}`}
					</button>
					{value !== suggested && (
						<button
							className='btn btn--sm btn--ghost'
							type='button'
							onClick={() => setValue(suggested)}>
							Usar sugerido ({suggested})
						</button>
					)}
					{changed && (
						<button
							className='btn btn--sm btn--ghost'
							type='button'
							onClick={() => setValue(p.price)}>
							Dejar {p.price}
						</button>
					)}
					<button
						className='btn btn--ghost btn--sm'
						type='button'
						onClick={() => setRejecting(true)}>
						Rechazar
					</button>
				</div>
				{needNote && (
					<ReviewNote
						id={p.id}
						rejecting={rejecting}
						note={note}
						error={error}
						busy={review.isPending}
						onNote={v => {
							setNote(v)
							setError(null)
						}}
						onReject={() => decide('rejected')}
						onCancel={() => setRejecting(false)}
					/>
				)}
			</div>
		</article>
	)
})
