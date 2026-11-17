import { useState } from 'react'

import { useHenFlocks } from '@/hooks/wallet/useHenFlocks'
import type { HenFlock } from '@/types/henhouseType'
import type { Movement } from '@/types/walletType'
import { cacaos } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { movementReference } from '@/utils/movementLabel'
import { stagger } from '@/utils/stagger'

import { CoopHen } from './coopHen'

const YEMAS_PER_EGG = 20
const MAX_EGGS = 6

const eggsFor = (total: number) =>
	Math.max(1, Math.min(MAX_EGGS, Math.ceil(total / YEMAS_PER_EGG)))

function CoopLedger({ flock }: { flock: HenFlock }) {
	return (
		<div className='coop-ledger'>
			<p className='coop-ledger__head'>
				<b>{flock.source}</b>
				<span>
					{cacaos(flock.total)} en{' '}
					{flock.moves.length === 1
						? '1 abono'
						: `${flock.moves.length} abonos`}
				</span>
			</p>
			<ol className='coop-ledger__list' role='list'>
				{flock.moves.map((move, i) => (
					<li
						key={move.id}
						className='coop-ledger__row animate-row-in'
						style={stagger(i)}>
						<span className='coop-ledger__egg' aria-hidden='true' />
						<span className='coop-ledger__text'>
							{movementReference(move) || move.label}
							<small>{shortDate(move.createdAt)}</small>
						</span>
						<b className='coop-ledger__n num'>+{move.amount}</b>
					</li>
				))}
			</ol>
		</div>
	)
}

function Backdrop() {
	return (
		<svg
			className='coop__backdrop'
			viewBox='0 0 640 240'
			preserveAspectRatio='none'
			aria-hidden='true'
			focusable='false'>
			<rect className='coop__wall' width='640' height='240' />
			<path
				className='coop__planks'
				d={Array.from({ length: 15 }, (_, i) => `M${(i + 1) * 40} 30V170`).join(
					''
				)}
			/>
			<circle className='coop__window' cx='120' cy='88' r='26' />
			<circle className='coop__window' cx='520' cy='88' r='26' />
			<path
				className='coop__mullion'
				d='M94 88h52M120 62v52M494 88h52M520 62v52'
			/>
			<rect className='coop__ground' y='164' width='640' height='76' />
			<path
				className='coop__hay'
				d='M20 190l18-6M70 214l20-5M130 196l16-7M200 222l18-4M262 192l20-6M330 216l14-6M398 198l18-5M460 224l20-4M520 194l16-6M590 214l18-5'
			/>
		</svg>
	)
}

export function Coop({ moves }: { moves: Movement[] }) {
	const flocks = useHenFlocks(moves)
	const [picked, setPicked] = useState<string | null>(null)
	const [pokes, setPokes] = useState(0)
	const flock = flocks.find(f => f.source === picked)

	if (!flocks.length) return null

	const pick = (source: string) => {
		setPokes(n => n + 1)
		setPicked(current => (current === source ? null : source))
	}

	return (
		<section className='coop' aria-labelledby='coop-title'>
			<div className='coop__head'>
				<h2 className='h3' id='coop-title'>
					Tu gallinero
				</h2>
				<p className='muted'>
					Cada gallina es de dónde te llegan yemas. Tócala para ver lo que te ha
					dado.
				</p>
			</div>
			<div className='coop__yard'>
				<Backdrop />
				<span className='coop__eave' aria-hidden='true' />
				<ul
					className='coop__nests'
					role='list'
					style={{ '--n': flocks.length }}>
					{flocks.map((f, i) => {
						const on = picked === f.source
						return (
							<li key={f.source} style={stagger(i)}>
								<button
									type='button'
									className={cn('nest', on && 'is-on')}
									aria-pressed={on}
									aria-controls='coop-ledger'
									aria-label={`${f.source}: ${cacaos(f.total)}`}
									onClick={() => pick(f.source)}>
									<span className='nest__tag' aria-hidden='true'>
										<b className='num'>+{f.total}</b>
										<span>{f.source}</span>
									</span>
									<CoopHen
										key={on ? `${f.source}-${pokes}` : f.source}
										breed={i}
										eggs={eggsFor(f.total)}
										active={on}
									/>
								</button>
							</li>
						)
					})}
				</ul>
			</div>
			<div id='coop-ledger' className='coop__ledger' aria-live='polite'>
				{flock ? (
					<CoopLedger key={flock.source} flock={flock} />
				) : (
					<p className='coop__hint muted'>
						Toca una gallina y aquí aparece la lista de lo que ganaste con ella.
					</p>
				)}
			</div>
		</section>
	)
}
