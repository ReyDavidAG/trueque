import { useFormContext, useWatch } from 'react-hook-form'

import { TextField } from '@/components/panel/text_field'
import { Icon } from '@/components/ui/icon'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { CategoryInfo } from '@/types/product_type'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

function PriceHint({
	category,
	cacaoValue,
}: {
	category: CategoryInfo
	cacaoValue: number
}) {
	const { control, setValue } = useFormContext<ProductForm>()
	const [costRaw, priceRaw] = useWatch({ control, name: ['cost', 'price'] })
	const cost = Number(costRaw) || 0
	const price = Number(priceRaw) || 0
	if (!cost)
		return (
			<p className='muted'>
				<Icon name='info' />
				Pon el costo y te sugerimos un precio: 1 cacao ={' '}
				{formatMoney(cacaoValue)}.
			</p>
		)
	const sug = Math.max(1, Math.round(cost / cacaoValue))
	const max = Math.max(category.priceMax, price, sug) * 1.15
	const x = (n: number) => `${(n / max) * 100}%`
	const out =
		price > 0 && (price < category.priceMin || price > category.priceMax)
	return (
		<>
			<div className='suggest'>
				<p>
					Precio sugerido: <b className='num'>{cacaos(sug)}</b>{' '}
					<span className='muted'>
						({formatMoney(cost)} ÷ {formatMoney(cacaoValue)})
					</span>
				</p>
				{price !== sug && (
					<button
						className='btn btn--sm btn--ghost'
						type='button'
						onClick={() =>
							setValue('price', String(sug), { shouldValidate: true })
						}>
						Usar {sug}
					</button>
				)}
			</div>
			<div
				className={cn('range', out && 'is-out')}
				role='img'
				aria-label={`Rango ${category.priceMin} a ${category.priceMax}`}>
				<span
					className='range__band'
					style={{
						left: x(category.priceMin),
						width: `calc(${x(category.priceMax)} - ${x(category.priceMin)})`,
					}}
				/>
				{price > 0 && (
					<span className='range__dot' style={{ left: x(price) }} />
				)}
				<span className='range__tick' style={{ left: x(sug) }} />
			</div>
			<p className='range__label'>
				{!price
					? 'La raya es el precio sugerido.'
					: out
						? 'Fuera del rango: RH te lo va a ajustar o rechazar.'
						: `Dentro del rango. Para la gente equivale a ${formatMoney(price * cacaoValue)}.`}
			</p>
		</>
	)
}

export function StepPrice({
	category,
	cacaoValue,
}: {
	category: CategoryInfo
	cacaoValue: number
}) {
	const { register, formState } = useFormContext<ProductForm>()
	const e = formState.errors
	return (
		<>
			<div className='field-pair'>
				<TextField
					id='p-cost'
					label='Costo real en pesos'
					hint='Lo que le cuesta a tu empresa dar este producto. Sale de tu presupuesto en cada canje.'
					error={e.cost?.message}
					className='num'
					inputMode='decimal'
					placeholder='300'
					register={register('cost')}
				/>
				<TextField
					id='p-price'
					label='Precio en cacaos'
					hint={`Rango de ${category.name.toLowerCase()}: de ${category.priceMin} a ${category.priceMax} cacaos.`}
					error={e.price?.message}
					className='num'
					inputMode='numeric'
					placeholder='60'
					register={register('price')}
				/>
			</div>
			<div className='price-hint'>
				<PriceHint category={category} cacaoValue={cacaoValue} />
			</div>
		</>
	)
}
