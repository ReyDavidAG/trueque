import { useMemo, useRef, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { MOVE_ICON } from '@/constants/wallet'
import type { Movement } from '@/types/walletType'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { isEarned, isTraded } from '@/utils/movementKind'
import { stagger } from '@/utils/stagger'

const FILTERS = [
	['all', 'Todas'],
	['earn', 'Ganadas'],
	['spend', 'Cambiadas'],
] as const

type Filter = (typeof FILTERS)[number][0]

const PAGE = 15

const TEST: Record<Filter, (m: Movement) => boolean> = {
	all: () => true,
	earn: isEarned,
	spend: isTraded,
}

export function MovesList({ moves }: { moves: Movement[] }) {
	const [filter, setFilter] = useState<Filter>('all')
	const [limit, setLimit] = useState(PAGE)
	const board = useRef<HTMLDivElement>(null)
	const less = () => {
		setLimit(PAGE)
		board.current?.scrollIntoView({ block: 'start' })
	}
	const shown = useMemo(() => moves.filter(TEST[filter]), [moves, filter])
	const pick = (next: Filter) => {
		setFilter(next)
		setLimit(PAGE)
	}

	return (
		<div ref={board} className='moves-board'>
			<div
				className='chip-row moves-board__filter'
				role='radiogroup'
				aria-label='Filtrar movimientos'>
				{FILTERS.map(([id, label]) => (
					<label key={id} className='chip-radio'>
						<input
							type='radio'
							name='moves-filter'
							checked={filter === id}
							onChange={() => pick(id)}
						/>
						<span>
							{label}
							<small className='chip-radio__n num'>
								{moves.filter(TEST[id]).length}
							</small>
						</span>
					</label>
				))}
			</div>
			{shown.length === 0 ? (
				<p className='muted moves-empty'>No hay movimientos de este tipo.</p>
			) : (
				<ol key={filter} className='moves-grid' role='list'>
					{shown.slice(0, limit).map((move, i) => (
						<li
							key={move.id}
							className={cn(
								'move-tile animate-tile-in',
								move.amount < 0 && 'is-spend'
							)}
							style={stagger(i % PAGE)}>
							<span className='move-tile__top'>
								<span className='move-tile__icon' aria-hidden='true'>
									<Icon name={MOVE_ICON[move.kind]} />
								</span>
								<b className='move-tile__n num'>
									{move.amount > 0 ? '+' : '−'}
									{Math.abs(move.amount)}
								</b>
							</span>
							<span className='move-tile__text'>{move.label}</span>
							<small className='move-tile__date'>
								{shortDate(move.createdAt)}
							</small>
						</li>
					))}
				</ol>
			)}
			{(shown.length > limit || limit > PAGE) && (
				<div className='moves-board__more'>
					{limit > PAGE && (
						<button type='button' className='btn btn--ghost' onClick={less}>
							Ver menos
						</button>
					)}
					{shown.length > limit && (
						<button
							type='button'
							className='btn btn--ghost'
							onClick={() => setLimit(n => n + PAGE)}>
							Ver más ({shown.length - limit})
						</button>
					)}
				</div>
			)}
		</div>
	)
}
