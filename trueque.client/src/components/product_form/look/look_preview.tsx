import { useFormContext, useWatch } from 'react-hook-form'

import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import type { LayerDragHandlers } from '@/hooks/panel/use_layer_drag'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { Layer } from '@/utils/art_recipe'
import { cn } from '@/utils/cn'
import { layerLabel } from '@/utils/layer_label'

interface LookPreviewProps {
	code: string
	layers: Layer[]
	stall: string
	draggable: boolean
	drag: LayerDragHandlers
}

export function LookPreview({ code, layers, stall, draggable, drag }: LookPreviewProps) {
	const { control } = useFormContext<ProductForm>()
	const name = useWatch({ control, name: 'name' })
	const price = Number(useWatch({ control, name: 'price' }))
	const shape = layers.map(l => l.kind + l.ref).join()

	return (
		<aside className='wizard__preview' aria-label='Así se verá tu puesto'>
			<article className='stall wizard__stall' data-stall={stall}>
				<div className='stall__awning' aria-hidden='true' />
				<div className='stall__link'>
					<div className='stall__art'>
						<span
							key={shape}
							className={cn('wizard__art', draggable && 'is-draggable')}
							{...drag}>
							<Art id={code} label={layerLabel(layers[0])} />
						</span>
					</div>
					{price > 0 && <PriceSign price={price} className='stall__sign' />}
					<div className='stall__body'>
						<h3 className='stall__name'>{name?.trim() || 'Tu producto'}</h3>
						<p className='stall__blurb'>{layers.map(layerLabel).join(' + ')}</p>
					</div>
				</div>
			</article>
			<p className='wizard__hint muted'>
				<Icon name='eye' />
				{draggable ? 'Arrastra el dibujo para mover la capa elegida' : 'Vista previa en vivo'}
			</p>
		</aside>
	)
}
