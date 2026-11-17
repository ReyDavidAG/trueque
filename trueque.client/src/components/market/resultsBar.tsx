import { Icon } from '@/components/ui/icon'
import { CATEGORY_LABELS } from '@/constants/stall'

export type CategoryFilter = keyof typeof CATEGORY_LABELS
export type PriceSort = 'asc' | 'desc'

interface Props {
	category: CategoryFilter
	counts: Record<CategoryFilter, number>
	total: number
	fits: number
	affordable: boolean
	sort: PriceSort
	onCategory: (c: CategoryFilter) => void
	onAffordable: (v: boolean) => void
	onSort: () => void
}

const isCategory = (v: string): v is CategoryFilter => v in CATEGORY_LABELS

const products = (n: number) => (n === 1 ? '1 producto' : `${n} productos`)
const reachable = (n: number) => (n === 1 ? '1 te alcanza' : `${n} te alcanzan`)

export function ResultsBar({
	category,
	counts,
	total,
	fits,
	affordable,
	sort,
	onCategory,
	onAffordable,
	onSort,
}: Props) {
	return (
		<div className='results' role='group' aria-label='Filtrar y ordenar'>
			<div
				className='chip-row results__cats'
				role='radiogroup'
				aria-label='Tipo'>
				{Object.entries(CATEGORY_LABELS).map(([id, label]) => (
					<label key={id} className='chip-radio'>
						<input
							type='radio'
							name='cat'
							value={id}
							checked={category === id}
							onChange={e =>
								isCategory(e.target.value) && onCategory(e.target.value)
							}
						/>
						<span>
							{label}
							{isCategory(id) && (
								<small className='chip-radio__n num'>{counts[id]}</small>
							)}
						</span>
					</label>
				))}
			</div>
			<div className='results__end'>
				<p className='results__count' role='status'>
					<b>{products(total)}</b>
					<span className='results__fit'> · {reachable(fits)}</span>
				</p>
				<label className='switch'>
					<input
						type='checkbox'
						checked={affordable}
						onChange={e => onAffordable(e.target.checked)}
					/>
					<span className='switch__track' aria-hidden='true' />
					<span>Sólo lo que me alcanza</span>
				</label>
				<button className='results__sort' type='button' onClick={onSort}>
					<Icon name='sort' />
					<span className='results__pre'>Precio: </span>
					<span>{sort === 'desc' ? 'mayor a menor' : 'menor a mayor'}</span>
				</button>
			</div>
		</div>
	)
}
