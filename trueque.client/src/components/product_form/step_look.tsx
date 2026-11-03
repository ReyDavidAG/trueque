import { useFormContext, useWatch } from 'react-hook-form'

import { Art } from '@/components/ui/art'
import { ART, ART_GROUPS } from '@/constants/art/art_catalog'
import { STALLS } from '@/constants/stall'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { ProductImage } from '@/types/product_type'

import { PhotoField } from './photo_field'

interface Props {
	images: ProductImage[]
	onImages: (images: ProductImage[]) => void
}

export function StepLook({ images, onImages }: Props) {
	const { register, control } = useFormContext<ProductForm>()
	const stall = useWatch({ control, name: 'stall' })
	return (
		<>
			<PhotoField images={images} onChange={onImages} />
			<fieldset className='field'>
				<legend>Color del toldo</legend>
				<div className='chip-row' role='radiogroup'>
					{STALLS.map(([v, l]) => (
						<label
							key={v}
							className='chip-radio chip-radio--swatch'
							data-stall={v}>
							<input type='radio' value={v} {...register('stall')} />
							<span>
								<i aria-hidden='true' />
								{l}
							</span>
						</label>
					))}
				</div>
			</fieldset>
			<fieldset className='field'>
				<legend>
					Ilustración{' '}
					{images.length > 0 && (
						<span className='muted'>(se usa si quitas las fotos)</span>
					)}
				</legend>
				<div className='artpick'>
					{ART_GROUPS.map(g => (
						<fieldset key={g.id} className='artpick__group'>
							<legend>{g.label}</legend>
							<div className='artpick__grid'>
								{ART.filter(a => a.group === g.id).map(a => (
									<label key={a.id} className='artpick__opt' data-stall={stall}>
										<input type='radio' value={a.id} {...register('art')} />
										<span className='artpick__img'>
											<Art id={a.id} />
										</span>
										<span className='artpick__label'>{a.label}</span>
									</label>
								))}
							</div>
						</fieldset>
					))}
				</div>
			</fieldset>
		</>
	)
}
