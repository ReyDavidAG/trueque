import { Art } from '@/components/ui/art'

export interface CompanyOption {
	id: string
	name: string
	count: number
	art: string | null
	stall: string
}

interface Props {
	options: CompanyOption[]
	value: string
	onChange: (id: string) => void
}

function AllIcon() {
	return (
		<svg className='mark' viewBox='0 0 512 512' aria-hidden='true'>
			<path
				className='mark__egg'
				d='M256 24c-98 0-180 156-180 282 0 108 80 182 180 182s180-74 180-182C436 180 354 24 256 24z'
			/>
			<circle className='mark__white' cx='256' cy='318' r='118' />
			<circle className='mark__yolk' cx='256' cy='318' r='78' />
		</svg>
	)
}

export function CompanyFilter({ options, value, onChange }: Props) {
	return (
		<fieldset className='side-card side-cos'>
			<legend className='side-card__title'>Empresa</legend>
			<div className='side-cos__list'>
				{options.map(o => (
					<label key={o.id} className='side-co' data-stall={o.stall}>
						<input
							type='radio'
							name='company'
							value={o.id}
							checked={value === o.id}
							onChange={() => onChange(o.id)}
						/>
						<span className='side-co__icon' aria-hidden='true'>
							{o.art ? <Art id={o.art} /> : <AllIcon />}
						</span>
						<span className='side-co__name' title={o.name}>
							{o.name}
						</span>
						<span className='side-co__n num'>{o.count}</span>
					</label>
				))}
			</div>
		</fieldset>
	)
}
