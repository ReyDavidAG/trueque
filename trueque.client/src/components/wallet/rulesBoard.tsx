import type { PointerEvent } from 'react'

import { Coin } from '@/components/ui/art'
import type { EarningRule } from '@/types/walletType'
import { formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

const SOURCE = { chispa: 'Chispa', insignias: 'Insignias', rh: 'RH' } as const
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
				<h2 className='board__title' id='board-title'>
					Lo que paga cada cosa
				</h2>
				<ul className='board__list' role='list'>
					{rules.map((r, i) => (
						<li
							key={r.code}
							className='board__row animate-row-in'
							style={stagger(i)}>
							<span className='board__what'>
								{r.label}
								<small>
									{SOURCE[r.source]}
									{r.note && ` · ${r.note}`}
								</small>
							</span>
							<span className='board__pay'>
								<b className='num'>{r.isVariable ? '10–100' : r.cacaos}</b>
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
					1 yema = {formatMoney(cacaoValue)} en productos. Valores de prueba,
					por calibrar con RH.
				</p>
			</section>
			<span className='easel__legs' aria-hidden='true' />
		</div>
	)
}
