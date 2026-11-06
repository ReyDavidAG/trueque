import type { ReactNode } from 'react'

import { formatMoney } from '@/utils/cacaos'

import { ChalkValue } from './chalkValue'

export function Chalkboard({
	lede,
	facts,
	includes,
	price,
	cacaoValue,
	fresh,
	children,
}: {
	lede: string
	facts: [string, string][]
	includes: string[]
	price: number
	cacaoValue: number
	fresh: Set<string>
	children: ReactNode
}) {
	return (
		<aside className='chalkboard'>
			<div className='chalkboard__board'>
				<p className='chalkboard__title'>¡Hoy le tenemos!</p>
				<p className='chalkboard__lede'>
					<ChalkValue value={lede} fresh={fresh.has('lede')} />
				</p>
				<p className='chalkboard__worth'>
					Equivale a{' '}
					<b>
						<ChalkValue value={formatMoney(price * cacaoValue)} />
					</b>{' '}
					en especie
				</p>
				<dl className='chalkboard__facts'>
					{facts.map(([k, v]) => (
						<div key={k}>
							<dt>{k}</dt>
							<dd>
								<ChalkValue value={v} fresh={fresh.has(k)} />
							</dd>
						</div>
					))}
				</dl>
				{includes.length > 0 && (
					<ul className='chalkboard__includes' role='list'>
						{includes.map(x => (
							<li key={x}>
								<ChalkValue value={x} fresh={fresh.has('includes')} />
							</li>
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
