import {
	CENTERED_LAYER,
	type KnobKey,
	SIZE_KNOBS,
} from '@/constants/lookEditor'
import type { Layer } from '@/utils/artRecipe'
import { cn } from '@/utils/cn'

type Placement = Pick<Layer, KnobKey | 'flip'>

interface LayerSizeProps {
	placement: Placement
	onChange: (patch: Partial<Placement>) => void
}

export function LayerSize({ placement, onChange }: LayerSizeProps) {
	return (
		<div className='field'>
			<div className='knobs'>
				{SIZE_KNOBS.map(({ label, key, min, max, unit }) => (
					<label key={key} className='knob'>
						<span className='knob__head'>
							{label}
							<b className='num'>
								{Math.round(placement[key])}
								{unit}
							</b>
						</span>
						<input
							type='range'
							min={min}
							max={max}
							value={placement[key]}
							onChange={e => onChange({ [key]: Number(e.target.value) })}
						/>
					</label>
				))}
			</div>
			<div className='tint-actions'>
				<button
					type='button'
					className={cn('btn btn--ghost btn--sm', placement.flip && 'is-on')}
					aria-pressed={placement.flip}
					onClick={() => onChange({ flip: !placement.flip })}>
					Espejo
				</button>
				<button
					type='button'
					className='btn btn--ghost btn--sm'
					onClick={() => onChange(CENTERED_LAYER)}>
					Centrar
				</button>
			</div>
		</div>
	)
}
