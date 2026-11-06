import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { LookTab } from '@/constants/look_editor'
import { useFigureFilter } from '@/hooks/panel/use_figure_filter'
import { useLayerComposer } from '@/hooks/panel/use_layer_composer'
import { useLayerDrag } from '@/hooks/panel/use_layer_drag'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { ProductImage } from '@/types/product_type'

import { LayerComposer } from './look/layer_composer'
import { LookPreview } from './look/look_preview'
import { LookTabs } from './look/look_tabs'
import { StallColorPane } from './look/stall_color_pane'
import { PhotoField } from './photo_field'

interface Props {
	images: ProductImage[]
	onImages: (images: ProductImage[]) => void
}

export function StepLook({ images, onImages }: Props) {
	const { register, control } = useFormContext<ProductForm>()
	const stall = useWatch({ control, name: 'stall' })
	const [tab, setTab] = useState<LookTab>('design')
	const composer = useLayerComposer()
	const figureFilter = useFigureFilter()
	const isDesigning = tab === 'design'
	const drag = useLayerDrag(composer.layer, isDesigning, composer.update)

	return (
		<div className='wizard'>
			<LookPreview
				code={composer.code}
				layers={composer.layers}
				stall={stall}
				draggable={isDesigning}
				drag={drag}
			/>
			<div className='wizard__panel'>
				<LookTabs tab={tab} photoCount={images.length} onTab={setTab} />
				<div key={tab} id='wizard-pane' role='tabpanel' className='wizard__pane'>
					{tab === 'stall' && <StallColorPane />}
					{isDesigning && (
						<LayerComposer composer={composer} figureFilter={figureFilter} stall={stall} />
					)}
					{tab === 'photos' && (
						<div className='field'>
							<PhotoField images={images} onChange={onImages} />
							{images.length > 0 && (
								<p className='muted'>Con fotos, el diseño se usa sólo si las quitas.</p>
							)}
						</div>
					)}
				</div>
				<input type='hidden' {...register('art')} />
			</div>
		</div>
	)
}
