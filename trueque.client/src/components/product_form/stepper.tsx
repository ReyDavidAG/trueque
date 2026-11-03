import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'

export const STEPS = [
	'Qué es',
	'Cómo se ve',
	'Precio',
	'Cuándo y dónde',
	'Revisa y manda',
] as const

export function Stepper({
	step,
	onGo,
}: {
	step: number
	onGo: (i: number) => void
}) {
	return (
		<ol className='stepper' role='list'>
			{STEPS.map((label, i) => (
				<li
					key={label}
					className={cn(
						'stepper__item',
						i === step && 'is-current',
						i < step && 'is-done'
					)}>
					<button
						type='button'
						disabled={i > step}
						aria-current={i === step ? 'step' : undefined}
						onClick={() => onGo(i)}>
						<span className='stepper__n num'>
							{i < step ? <Icon name='check' /> : i + 1}
						</span>
						<span className='stepper__label'>{label}</span>
					</button>
				</li>
			))}
		</ol>
	)
}
