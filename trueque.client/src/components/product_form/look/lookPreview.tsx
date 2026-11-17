import { useFormContext, useWatch } from 'react-hook-form'

import { Art, Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import type { LayerDragHandlers } from '@/hooks/panel/useLayerDrag'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { Layer } from '@/utils/artRecipe'
import { cn } from '@/utils/cn'
import { layerLabel } from '@/utils/layerLabel'

interface LookPreviewProps {
	code: string
	layers: Layer[]
	stall: string
	companyName: string
	photo?: string
	draggable: boolean
	drag: LayerDragHandlers
}

export function LookPreview({
	code,
	layers,
	stall,
	companyName,
	photo,
	draggable,
	drag,
}: LookPreviewProps) {
	const { control } = useFormContext<ProductForm>()
	const name = useWatch({ control, name: 'name' })
	const blurb = useWatch({ control, name: 'blurb' })
	const price = Number(useWatch({ control, name: 'price' }))
	const shape = layers.map(l => l.kind + l.ref).join()
	const showPhoto = Boolean(photo) && !draggable

	return (
		<aside className='wizard__preview' aria-label='Así se verá tu producto'>
			<p className='kicker'>Así se verá en la despensa</p>
			<article className='bcard wizard__card' data-stall={stall}>
				<div className='bcard__link'>
					<div className='bcard__pic'>
						{showPhoto ? (
							<img className='cover' src={photo} alt='' />
						) : (
							<span
								key={shape}
								className={cn('wizard__art', draggable && 'is-draggable')}
								{...drag}>
								<Art id={code} label={layerLabel(layers[0])} />
							</span>
						)}
					</div>
					<div className='bcard__body'>
						<span className='bcard__by'>{companyName}</span>
						<h3 className='bcard__name'>{name?.trim() || 'Tu producto'}</h3>
						<p className='bcard__blurb'>
							{blurb?.trim() || layers.map(layerLabel).join(' + ')}
						</p>
						<div className='bcard__foot'>
							<span className='bcard__price'>
								<Coin className='bcard__coin' />
								<b className='num'>{price > 0 ? price : '—'}</b>
								<small>{price === 1 ? 'yema' : 'yemas'}</small>
							</span>
						</div>
					</div>
				</div>
			</article>
			<p className='wizard__hint muted'>
				<Icon name='eye' />
				{draggable
					? 'Arrastra el dibujo para mover la capa elegida'
					: 'Vista previa en vivo'}
			</p>
		</aside>
	)
}
