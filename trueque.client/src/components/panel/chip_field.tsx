import type { UseFormRegisterReturn } from 'react-hook-form'

interface Props {
	legend: string
	options: ReadonlyArray<readonly [string, string]>
	register: UseFormRegisterReturn
}

export function ChipField({ legend, options, register }: Props) {
	return (
		<fieldset className='field'>
			<legend>{legend}</legend>
			<div className='chip-row' role='radiogroup'>
				{options.map(([v, l]) => (
					<label key={v} className='chip-radio'>
						<input type='radio' value={v} {...register} />
						<span>{l}</span>
					</label>
				))}
			</div>
		</fieldset>
	)
}
