import type { CSSProperties, PointerEvent, ReactNode } from 'react'

import { Coin } from '@/components/ui/art'
import type { EarningRule } from '@/types/walletType'
import { formatMoney } from '@/utils/cacaos'

const SOURCE = { chispa: 'Chispa', insignias: 'Insignias', rh: 'RH' } as const
const CHALKS = ['maiz', 'estraza', 'estraza']
const FIRST_MS = 500
const STEP_MS = 650

const writeStyle = (i: number): CSSProperties => ({
	'--write-delay': `${FIRST_MS + i * STEP_MS}ms`,
})

function Scribble({ children }: { children: ReactNode }) {
	return (
		<span className='scribble'>
			{children}
			<span className='scribble__wipe' aria-hidden='true' />
			<span className='scribble__pen' aria-hidden='true'>
				<span className='crayon' />
			</span>
		</span>
	)
}

const tilt = (e: PointerEvent<HTMLElement>) => {
	const r = e.currentTarget.getBoundingClientRect()
	const x = (e.clientX - r.left) / r.width - 0.5
	const y = (e.clientY - r.top) / r.height - 0.5
	e.currentTarget.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`)
	e.currentTarget.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`)
}

const untilt = (e: PointerEvent<HTMLElement>) => {
	e.currentTarget.style.setProperty('--tilt-x', '0deg')
	e.currentTarget.style.setProperty('--tilt-y', '0deg')
}

export function RulesBoard({
	rules,
	cacaoValue,
}: {
	rules: EarningRule[]
	cacaoValue: number
}) {
	return (
		<div className='easel'>
			<section
				className='board'
				aria-labelledby='board-title'
				onPointerMove={tilt}
				onPointerLeave={untilt}>
				<h2 className='board__title' id='board-title' style={writeStyle(0)}>
					<Scribble>Lo que paga cada cosa</Scribble>
				</h2>
				<ul className='board__list' role='list'>
					{rules.map((r, i) => (
						<li key={r.code} className='board__row' style={writeStyle(i + 1)}>
							<span className='board__what'>
								<Scribble>{r.label}</Scribble>
								<small>
									{SOURCE[r.source]}
									{r.note && ` · ${r.note}`}
								</small>
							</span>
							<span className='board__pay'>
								<b className='num'>
									<Scribble>{r.isVariable ? '10–100' : r.cacaos}</Scribble>
								</b>
								{(r.cacaos > 0 || r.isVariable) && (
									<Coin className='board__bean' />
								)}
								{r.monthlyCap ? (
									<small>hasta {r.monthlyCap} al mes</small>
								) : (
									r.cacaos > 0 && (
										<small>≈ {formatMoney(r.cacaos * cacaoValue)}</small>
									)
								)}
							</span>
						</li>
					))}
				</ul>
				<p className='board__foot'>
					1 cacao = {formatMoney(cacaoValue)} en productos. Valores de prueba,
					por calibrar con RH.
				</p>
				<span className='board__tray' aria-hidden='true'>
					{CHALKS.map((c, i) => (
						<span
							key={i}
							className='crayon crayon--rest'
							style={{ '--crayon': `var(--color-${c})` }}
						/>
					))}
				</span>
			</section>
			<span className='easel__legs' aria-hidden='true' />
		</div>
	)
}
