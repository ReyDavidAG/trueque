import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { ART_GROUPS } from '@/constants/art/artCatalog'
import { ALL_FIGURES, MAX_STAGGER } from '@/constants/lookEditor'
import type { FigureFilter } from '@/hooks/panel/useFigureFilter'

interface FigurePickerProps {
	selectedRef: string
	stall: string
	filter: FigureFilter
	onPick: (ref: string) => void
}

export function FigurePicker({
	selectedRef,
	stall,
	filter,
	onPick,
}: FigurePickerProps) {
	const { group, setGroup, query, setQuery, figures } = filter
	return (
		<div className='field'>
			<div className='figure-tools'>
				<label className='figure-search'>
					<Icon name='search' />
					<input
						className='input'
						type='search'
						placeholder='Busca una figura: taza, comida, gorra…'
						value={query}
						onChange={e => setQuery(e.target.value)}
						aria-label='Buscar figura'
					/>
				</label>
				<div className='chip-row' role='radiogroup' aria-label='Tipo de figura'>
					{[ALL_FIGURES, ...ART_GROUPS].map(g => (
						<label key={g.id} className='chip-radio'>
							<input
								type='radio'
								name='figure-group'
								checked={group === g.id}
								onChange={() => setGroup(g.id)}
							/>
							<span>{g.label}</span>
						</label>
					))}
				</div>
			</div>
			{figures.length ? (
				<div className='figure-grid' role='radiogroup' aria-label='Figura'>
					{figures.map((a, i) => (
						<label
							key={a.id}
							className='figure'
							data-stall={stall}
							style={{ '--i': Math.min(i, MAX_STAGGER) }}>
							<input
								type='radio'
								name='figure'
								checked={selectedRef === a.id}
								onChange={() => onPick(a.id)}
							/>
							<span className='figure__img'>
								<Art id={a.id} />
							</span>
							<span className='figure__label'>{a.label}</span>
						</label>
					))}
				</div>
			) : (
				<p className='muted'>No hay figuras con “{query}”.</p>
			)}
		</div>
	)
}
