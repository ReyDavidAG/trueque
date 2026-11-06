import { MAX_WORD } from '@/utils/art_recipe'

interface LayerTextFieldProps {
	value: string
	onChange: (text: string) => void
}

export function LayerTextField({ value, onChange }: LayerTextFieldProps) {
	return (
		<label className='field'>
			<span>Texto de la capa</span>
			<input
				className='input'
				maxLength={MAX_WORD}
				value={value}
				onChange={e => onChange(e.target.value.slice(0, MAX_WORD))}
			/>
			<small className='field__help'>
				Hasta {MAX_WORD} letras. Por ejemplo: 2x1, Nuevo, Hoy.
			</small>
		</label>
	)
}
