import { Icon } from '@/components/ui/icon'
import type { CategoryInfo } from '@/types/productType'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

interface Props {
	id: string
	name: string
	proposed: number
	suggested: number
	value: number
	range: CategoryInfo
	cacaoValue: number
	onChange: (v: number) => void
}

export function PriceSlider({
	id,
	name,
	proposed,
	suggested,
	value,
	range,
	cacaoValue,
	onChange,
}: Props) {
	const max =
		Math.ceil((Math.max(range.priceMax, proposed, suggested) * 1.15) / 10) * 10
	const x = (n: number) => `${(n / max) * 100}%`
	const out = value < range.priceMin || value > range.priceMax
	const changed = value !== proposed
	return (
		<>
			<div className={cn('range range--live', out && 'is-out')}>
				<span
					className='range__band'
					style={{
						left: x(range.priceMin),
						width: `calc(${x(range.priceMax)} - ${x(range.priceMin)})`,
					}}
				/>
				<span className='range__tick' style={{ left: x(suggested) }} />
				<span
					className='range__ghost'
					style={{ left: x(proposed) }}
					title='Propuesto'
				/>
				<input
					id={`slide-${id}`}
					className='range__input'
					type='range'
					min={1}
					max={max}
					step={1}
					value={value}
					aria-label={`Precio a aprobar de ${name}`}
					aria-valuetext={`${value} cacaos`}
					onChange={e => onChange(Number(e.target.value))}
				/>
			</div>
			<p className='range__label'>
				{out ? (
					<>
						<Icon name='info' />
						Fuera del rango de {range.name.toLowerCase()} ({range.priceMin}–
						{range.priceMax}): muévelo a la franja verde.
					</>
				) : changed ? (
					<>
						Ajustas de {proposed} a <b className='num'>{value}</b> · equivale a{' '}
						{formatMoney(value * cacaoValue)} · la raya es el sugerido (
						{suggested})
					</>
				) : (
					<>
						Dentro del rango ({range.priceMin}–{range.priceMax}). Arrastra el
						punto para ajustar · la raya es el sugerido ({suggested})
					</>
				)}
			</p>
		</>
	)
}
