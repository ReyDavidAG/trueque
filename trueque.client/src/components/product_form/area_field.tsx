import type { TextareaHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { useTyped } from '@/hooks/ui/use_typed'
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
	const typed = useTyped<HTMLTextAreaElement>(register, true)
	return (
		<div className='field'>
			<label htmlFor={id}>
				{label} {optional && <span className='muted'>(opcional)</span>}
			</label>
			<div className='typed'>
				<textarea
					id={id}
					className={cn(
						'input input--area typed__field',
						error && 'animate-nudge'
					)}
					rows={3}
					aria-invalid={Boolean(error)}
					aria-describedby={`${id}-help`}
					{...rest}
					{...typed.bind}
				/>
				<span className='input input--area typed__mirror' aria-hidden='true'>
					<span ref={typed.text} className='typed__text'>
						{typed.chars.map(c => (
							<span key={c.id} className='typed__ch'>
								{c.ch}
							</span>
						))}
					</span>
				</span>
			</div>
			<p className={cn('field__help', error && 'is-error')} id={`${id}-help`}>
				{error ?? hint}
			</p>
		</div>
	)
}
