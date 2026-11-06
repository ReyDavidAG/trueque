import type { TextareaHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { useTyped } from '@/hooks/ui/useTyped'
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
	const { bind, text, chars } = useTyped<HTMLTextAreaElement>(register, true)
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
					{...bind}
				/>
				<span className='input input--area typed__mirror' aria-hidden='true'>
					<span ref={text} className='typed__text'>
						{chars.map(c => (
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
