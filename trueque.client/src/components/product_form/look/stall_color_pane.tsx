import { useFormContext } from 'react-hook-form'

import { STALLS } from '@/constants/stall'
import type { ProductForm } from '@/schemas/panel/product/product.schema'

export function StallColorPane() {
	const { register } = useFormContext<ProductForm>()
	return (
		<fieldset className='field'>
			<legend>Color de la tienda</legend>
			<div className='swatches' role='radiogroup'>
				{STALLS.map(([value, label], i) => (
					<label key={value} className='swatch' data-stall={value} style={{ '--i': i }}>
						<input type='radio' value={value} {...register('stall')} />
						<span className='swatch__card'>
							<span className='swatch__awning' aria-hidden='true' />
							<span className='swatch__name'>{label}</span>
						</span>
					</label>
				))}
			</div>
		</fieldset>
	)
}
