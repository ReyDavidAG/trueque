import { Icon } from '@/components/ui/icon'

export type PriceSort = 'asc' | 'desc'

export interface CategoryOption {
	id: string
	label: string
	count: number
}

interface Props {
	category: string
	options: CategoryOption[]
	total: number
	fits: number
	affordable: boolean
	sort: PriceSort
	onCategory: (c: string) => void
	onAffordable: (v: boolean) => void
	onSort: () => void
}

const products = (n: number) => (n === 1 ? '1 producto' : `${n} productos`)
const reachable = (n: number) => (n === 1 ? '1 te alcanza' : `${n} te alcanzan`)

export function ResultsBar({
	category,
	options,
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
				aria-label='Categoría'>
				{options.map(o => (
					<label key={o.id} className='chip-radio'>
						<input
							type='radio'
							name='cat'
							value={o.id}
							checked={category === o.id}
							onChange={() => onCategory(o.id)}
						/>
						<span>
							{o.label}
							<small className='chip-radio__n num'>{o.count}</small>
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
