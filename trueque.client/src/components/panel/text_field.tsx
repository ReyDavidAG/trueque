import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { cn } from '@/utils/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	hint: string
	error?: string
	register: UseFormRegisterReturn
}

export function TextField({
	id,
	label,
	hint,
	error,
	register,
	className = '',
	...rest
}: Props) {
	return (
		<div className='field'>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				className={cn('input', className, error && 'animate-nudge')}
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
