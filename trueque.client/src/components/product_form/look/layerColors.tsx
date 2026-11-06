import { Icon } from '@/components/ui/icon'
import { ART_COLORS, type ArtColor, type Swaps } from '@/utils/artRecipe'

interface LayerColorsProps {
	palette: ArtColor[]
	swaps: Swaps
	onSwaps: (swaps: Swaps) => void
	onShuffle: () => void
}

export function LayerColors({
	palette,
	swaps,
	onSwaps,
	onShuffle,
}: LayerColorsProps) {
	if (!palette.length)
		return <p className='muted'>Esta capa no tiene colores para cambiar.</p>
	return (
		<div className='field'>
			{palette.map((from, i) => {
				const current = swaps[from] ?? from
				return (
					<fieldset key={from} className='tint-row' style={{ '--i': i }}>
						<legend>Color {i + 1}</legend>
						<div className='tint-row__chips' role='radiogroup'>
							{ART_COLORS.map(([color, label]) => (
								<label
									key={color}
									className='tint'
									data-tint={color}
									title={label}>
									<input
										type='radio'
										name={`tint-${from}`}
										checked={current === color}
										onChange={() => onSwaps({ ...swaps, [from]: color })}
										aria-label={label}
									/>
									<span aria-hidden='true' />
								</label>
							))}
						</div>
					</fieldset>
				)
			})}
			<div className='tint-actions'>
				<button
					type='button'
					className='btn btn--ghost btn--sm'
					onClick={onShuffle}>
					<Icon name='spark' />
					Al azar
				</button>
				<button
					type='button'
					className='btn btn--ghost btn--sm'
					disabled={!Object.keys(swaps).length}
					onClick={() => onSwaps({})}>
					Como venía
				</button>
			</div>
		</div>
	)
}
