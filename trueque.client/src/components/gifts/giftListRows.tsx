import { type UseFieldArrayReturn, useFormContext } from 'react-hook-form'

import { TextField } from '@/components/panel/textField'
import { Icon } from '@/components/ui/icon'
import type { GrantForm } from '@/schemas/grants/grant.schema'

export function GiftListRows({
	list,
}: {
	list: UseFieldArrayReturn<GrantForm, 'list'>
}) {
	const { register, formState } = useFormContext<GrantForm>()
	const errors = formState.errors.list
	return (
		<ol className='gift-list' role='list'>
			{list.fields.map((f, i) => (
				<li key={f.id} className='gift-list__row'>
					<TextField
						id={`g-num-${i}`}
						label='Número de trabajador'
						hint='5 dígitos o más.'
						error={errors?.[i]?.employeeNumber?.message}
						className='num'
						inputMode='numeric'
						register={register(`list.${i}.employeeNumber`)}
					/>
					<TextField
						id={`g-amt-${i}`}
						label='Yemas'
						hint='Para esta persona.'
						error={errors?.[i]?.amount?.message}
						className='input--sm num'
						inputMode='numeric'
						register={register(`list.${i}.amount`)}
					/>
					<TextField
						id={`g-note-${i}`}
						label='Por qué a esta persona'
						hint='Al menos 10 letras.'
						error={errors?.[i]?.note?.message}
						maxLength={200}
						register={register(`list.${i}.note`)}
					/>
					<button
						type='button'
						className='btn btn--ghost btn--sm gift-list__remove'
						aria-label={`Quitar a la persona ${i + 1}`}
						onClick={() => list.remove(i)}>
						<Icon name='trash' />
					</button>
				</li>
			))}
		</ol>
	)
}
