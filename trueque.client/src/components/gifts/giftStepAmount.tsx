import { useFormContext } from 'react-hook-form'

import { TextField } from '@/components/panel/textField'
import type { GrantForm } from '@/schemas/grants/grant.schema'

import { GiftTotals } from './giftTotals'

interface Props {
	maxPerPerson: number
	maxPerYear: number
	totals: { people: number; yemas: number; pesos: number; counting: boolean }
}

export function GiftStepAmount({ maxPerPerson, maxPerYear, totals }: Props) {
	const { register, watch, formState } = useFormContext<GrantForm>()
	const isList = watch('scope') === 'list'
	return (
		<>
			{isList ? (
				<p className='muted'>
					En una lista cada persona lleva su monto; lo cambias en el paso
					anterior.
				</p>
			) : (
				<TextField
					id='g-amount'
					label='Yemas por persona'
					hint={`Hasta ${maxPerPerson} por regalo y ${maxPerYear} de regalo al año por persona.`}
					error={formState.errors.amount?.message}
					className='num'
					inputMode='numeric'
					register={register('amount')}
				/>
			)}
			<GiftTotals {...totals} />
		</>
	)
}
