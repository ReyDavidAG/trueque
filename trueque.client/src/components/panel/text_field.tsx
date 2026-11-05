import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { useTyped } from '@/hooks/ui/use_typed'
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
	const typed = useTyped<HTMLInputElement>(register)
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
					{...typed.bind}
				/>
				{smooth && (
					<span className={cn('input typed__mirror', className)} aria-hidden='true'>
						<span ref={typed.text} className='typed__text'>
							{typed.chars.map(c => (
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
