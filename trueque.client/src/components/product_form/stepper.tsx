import { useEffect, useRef } from 'react'

import { Coin } from '@/components/ui/art'
import { burstCacao } from '@/components/ui/cacao_confetti'
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
	reach,
	onGo,
}: {
	step: number
	reach: number
	onGo: (i: number) => void
}) {
	const dots = useRef<(HTMLSpanElement | null)[]>([])
	const last = useRef(step)

	useEffect(() => {
		const prev = last.current
		last.current = step
		if (step <= prev) return
		const dot = dots.current[prev]
		if (!dot) return
		const r = dot.getBoundingClientRect()
		burstCacao({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 26 })
	}, [step])

	return (
		<ol
			className='stepper'
			role='list'
			style={{ '--p': step / (STEPS.length - 1) }}>
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
						disabled={i > reach}
						aria-current={i === step ? 'step' : undefined}
						aria-label={i < step ? `${label}, listo` : undefined}
						onClick={() => onGo(i)}>
						<span
							ref={el => {
								dots.current[i] = el
							}}
							className='stepper__n num'>
							{i < step ? <Coin className='stepper__coin' /> : i + 1}
						</span>
						<span className='stepper__label'>{label}</span>
					</button>
				</li>
			))}
		</ol>
	)
}
