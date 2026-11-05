import type { ReactNode } from 'react'

import { formatMoney } from '@/utils/cacaos'

export function Chalkboard({
	lede,
	facts,
	includes,
	price,
	cacaoValue,
	children,
}: {
	lede: string
	facts: [string, string][]
	includes: string[]
	price: number
	cacaoValue: number
	children: ReactNode
}) {
	return (
		<aside className='chalkboard'>
			<div className='chalkboard__board'>
				<p className='chalkboard__title'>¡Hoy le tenemos!</p>
				<p className='chalkboard__lede'>{lede}</p>
				<p className='chalkboard__worth'>
					Equivale a <b>{formatMoney(price * cacaoValue)}</b> en especie
				</p>
				<dl className='chalkboard__facts'>
					{facts.map(([k, v]) => (
						<div key={k}>
							<dt>{k}</dt>
							<dd>{v}</dd>
						</div>
					))}
				</dl>
				{includes.length > 0 && (
					<ul className='chalkboard__includes' role='list'>
						{includes.map(x => (
							<li key={x}>{x}</li>
						))}
					</ul>
				)}
				{children}
				<span className='chalkboard__chalk' aria-hidden='true' />
			</div>
			<span className='chalkboard__legs' aria-hidden='true' />
		</aside>
	)
}
