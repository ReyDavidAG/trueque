import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { MOVE_FILTERS, MOVE_ICON, type MoveFilter } from '@/constants/wallet'
import type { Movement } from '@/types/wallet_type'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

export function MovesFilter({
	value,
	onChange,
}: {
	value: MoveFilter
	onChange: (filter: MoveFilter) => void
}) {
	return (
		<div className='chip-row' role='radiogroup' aria-label='Filtrar movimientos'>
			{MOVE_FILTERS.map(([id, label]) => (
				<label key={id} className='chip-radio'>
					<input
						type='radio'
						name='moves-filter'
						checked={value === id}
						onChange={() => onChange(id)}
					/>
					<span>{label}</span>
				</label>
			))}
		</div>
	)
}

export function MovesList({ moves, listKey }: { moves: Movement[]; listKey: string }) {
	return (
		<ol key={listKey} className='moves' role='list'>
			{moves.map((move, i) => (
				<li
					key={move.id}
					className={cn('move animate-row-in', move.amount < 0 && 'is-spend')}
					style={stagger(i)}>
					<span className='move__icon' aria-hidden='true'>
						<Coin className='move__coin' />
						<Icon name={MOVE_ICON[move.kind]} />
					</span>
					<span className='move__text'>
						{move.label}
						<small>{shortDate(move.createdAt)}</small>
					</span>
					<span className='move__n num'>
						{move.amount > 0 ? '+' : '−'}
						{Math.abs(move.amount)}
					</span>
				</li>
			))}
		</ol>
	)
}
