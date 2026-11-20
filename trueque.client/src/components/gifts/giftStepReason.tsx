import { useFormContext } from 'react-hook-form'

import { ChipField } from '@/components/panel/chipField'
import { TextField } from '@/components/panel/textField'
import { AreaField } from '@/components/product_form/areaField'
import type { GrantForm } from '@/schemas/grants/grant.schema'
import type { GrantOccasion } from '@/types/grantType'

export function GiftStepReason({ occasions }: { occasions: GrantOccasion[] }) {
	const { register, formState } = useFormContext<GrantForm>()
	const e = formState.errors
	return (
		<>
			<ChipField
				legend='Ocasión'
				options={occasions.map(o => [o.code, o.name] as const)}
				register={register('occasion')}
			/>
			{e.occasion && (
				<p className='field__help is-error'>{e.occasion.message}</p>
			)}
			<TextField
				id='g-name'
				label='Nombre'
				hint='Así lo verá cada persona en su aviso. Ej. Regalo de Navidad 2026.'
				error={e.name?.message}
				maxLength={80}
				register={register('name')}
			/>
			<AreaField
				id='g-reason'
				label='Por qué'
				hint='Lo lee quien autoriza y queda en la bitácora. De 20 a 500 letras.'
				error={e.reason?.message}
				maxLength={500}
				register={register('reason')}
			/>
		</>
	)
}
