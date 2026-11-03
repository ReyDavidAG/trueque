import type { TextareaHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { cn } from '@/utils/cn'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	id: string
	label: string
	optional?: boolean
	hint: string
	error?: string
	register: UseFormRegisterReturn
}

export function AreaField({
	id,
	label,
	optional = false,
	hint,
	error,
	register,
	...rest
}: Props) {
	return (
		<div className='field'>
			<label htmlFor={id}>
				{label} {optional && <span className='muted'>(opcional)</span>}
			</label>
			<textarea
				id={id}
				className={cn('input input--area', error && 'animate-nudge')}
				rows={3}
				aria-invalid={Boolean(error)}
				aria-describedby={`${id}-help`}
				{...rest}
				{...register}
			/>
			<p className={cn('field__help', error && 'is-error')} id={`${id}-help`}>
				{error ?? hint}
			</p>
		</div>
	)
}
