import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { useTyped } from '@/hooks/ui/useTyped'
import { cn } from '@/utils/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	hint: string
	error?: string
	register: UseFormRegisterReturn
}

const TYPED = new Set([undefined, 'text', 'search'])

export function TextField({
	id,
	label,
	hint,
	error,
	register,
	className = '',
	...rest
}: Props) {
	const { bind, text, chars } = useTyped<HTMLInputElement>(register)
	const smooth = TYPED.has(rest.type)
	return (
		<div className='field'>
			<label htmlFor={id}>{label}</label>
			<div className={cn(smooth && 'typed')}>
				<input
					id={id}
					className={cn(
						'input',
						className,
						smooth && 'typed__field',
						error && 'animate-nudge'
					)}
					aria-invalid={Boolean(error)}
					aria-describedby={`${id}-help`}
					{...rest}
					{...bind}
				/>
				{smooth && (
					<span
						className={cn('input typed__mirror', className)}
						aria-hidden='true'>
						<span ref={text} className='typed__text'>
							{chars.map(c => (
								<span key={c.id} className='typed__ch'>
									{c.ch}
								</span>
							))}
						</span>
					</span>
				)}
			</div>
			<p className={cn('field__help', error && 'is-error')} id={`${id}-help`}>
				{error ?? hint}
			</p>
		</div>
	)
}
