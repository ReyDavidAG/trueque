import { Art } from '@/components/ui/art'
import { SHAPES } from '@/constants/art/artShapes'
import { encodeDesign, newLayer } from '@/utils/artRecipe'

interface ShapePickerProps {
	selectedRef: string
	stall: string
	onPick: (ref: string) => void
}

export function ShapePicker({ selectedRef, stall, onPick }: ShapePickerProps) {
	return (
		<div className='figure-grid' role='radiogroup' aria-label='Forma'>
			{SHAPES.map((s, i) => (
				<label
					key={s.id}
					className='figure'
					data-stall={stall}
					style={{ '--i': i }}>
					<input
						type='radio'
						name='shape'
						checked={selectedRef === s.id}
						onChange={() => onPick(s.id)}
					/>
					<span className='figure__img'>
						<Art id={encodeDesign([newLayer('s', s.id)])} />
					</span>
					<span className='figure__label'>{s.label}</span>
				</label>
			))}
		</div>
	)
}
