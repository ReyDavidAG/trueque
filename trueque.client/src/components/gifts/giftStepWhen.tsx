import { useFormContext } from 'react-hook-form'

import { ChipField } from '@/components/panel/chipField'
import { TextField } from '@/components/panel/textField'
import { LOT_MONTH_OPTIONS } from '@/constants/grants'
import type { GrantForm } from '@/schemas/grants/grant.schema'
import { isoDay } from '@/utils/dates'

export function GiftStepWhen({ maxDaysAhead }: { maxDaysAhead: number }) {
	const { register, formState } = useFormContext<GrantForm>()
	const e = formState.errors
	return (
		<>
			<TextField
				id='g-deliver'
				type='date'
				label='Día de entrega'
				hint={`Si es hoy, se entrega al autorizar. Hasta ${maxDaysAhead} días hacia adelante.`}
				error={e.deliverOn?.message}
				min={isoDay()}
				max={isoDay(maxDaysAhead)}
				register={register('deliverOn')}
			/>
			<ChipField
				legend='Las yemas vencen en'
				options={LOT_MONTH_OPTIONS.map(
					m => [m, m === '1' ? '1 mes' : `${m} meses`] as const
				)}
				register={register('lotMonths')}
			/>
			<p className='field__help'>
				{e.lotMonths?.message ??
					'Desde el día de entrega. Se gastan primero si vencen antes.'}
			</p>
		</>
	)
}
