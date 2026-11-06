import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { LookTab } from '@/constants/lookEditor'
import { useFigureFilter } from '@/hooks/panel/useFigureFilter'
import { useLayerComposer } from '@/hooks/panel/useLayerComposer'
import { useLayerDrag } from '@/hooks/panel/useLayerDrag'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { ProductImage } from '@/types/productType'

import { LayerComposer } from './look/layerComposer'
import { LookPreview } from './look/lookPreview'
import { LookTabs } from './look/lookTabs'
import { StallColorPane } from './look/stallColorPane'
import { PhotoField } from './photoField'

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
				<div
					key={tab}
					id='wizard-pane'
					role='tabpanel'
					className='wizard__pane'>
					{tab === 'stall' && <StallColorPane />}
					{isDesigning && (
						<LayerComposer
							composer={composer}
							figureFilter={figureFilter}
							stall={stall}
						/>
					)}
					{tab === 'photos' && (
						<div className='field'>
							<PhotoField images={images} onChange={onImages} />
							{images.length > 0 && (
								<p className='muted'>
									Con fotos, el diseño se usa sólo si las quitas.
								</p>
							)}
						</div>
					)}
				</div>
				<input type='hidden' {...register('art')} />
			</div>
		</div>
	)
}
