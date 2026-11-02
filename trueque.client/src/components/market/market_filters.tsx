import { CATEGORY_LABELS } from '@/constants/stall'

export type CategoryFilter = keyof typeof CATEGORY_LABELS

interface Props {
	category: CategoryFilter
	affordable: boolean
	onCategory: (c: CategoryFilter) => void
	onAffordable: (v: boolean) => void
}

const isCategory = (v: string): v is CategoryFilter => v in CATEGORY_LABELS

export function MarketFilters({
	category,
	affordable,
	onCategory,
	onAffordable,
}: Props) {
	return (
		<div className='market-tools' role='group' aria-label='Filtrar el mercado'>
			<div className='chip-row' role='radiogroup' aria-label='Tipo'>
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
						<span>{label}</span>
					</label>
				))}
			</div>
			<label className='switch'>
				<input
					type='checkbox'
					checked={affordable}
					onChange={e => onAffordable(e.target.checked)}
				/>
				<span className='switch__track' aria-hidden='true' />
				<span>Sólo lo que me alcanza</span>
			</label>
		</div>
	)
}
