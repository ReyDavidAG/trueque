import type { UseFormRegister } from 'react-hook-form'

import { Art } from '@/components/ui/art'
import type { PublishProductForm } from '@/schemas/panel/publish/publish_product.schema'

const ARTS = [
	['thermos', 'Termo o taza'],
	['cap', 'Ropa'],
	['plate', 'Comida'],
	['apple', 'Salud'],
	['chat', 'Acompañamiento'],
	['glasses', 'Óptica'],
	['wrench', 'Taller'],
	['diploma', 'Curso'],
	['laptop', 'Equipo'],
] as const

export function ArtPicker({
	register,
}: {
	register: UseFormRegister<PublishProductForm>
}) {
	return (
		<fieldset className='field'>
			<legend>Ilustración del puesto</legend>
			<div className='art-picks' role='radiogroup'>
				{ARTS.map(([v, l]) => (
					<label key={v} className='art-pick' title={l}>
						<input type='radio' value={v} {...register('art')} />
						<span className='art-pick__box'>
							<Art id={v} />
						</span>
						<span className='art-pick__label'>{l}</span>
					</label>
				))}
			</div>
		</fieldset>
	)
}
