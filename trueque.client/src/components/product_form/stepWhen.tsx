import { useFormContext } from 'react-hook-form'

import { ChipField } from '@/components/panel/chipField'
import { TextField } from '@/components/panel/textField'
import { Icon } from '@/components/ui/icon'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { ExchangeLocation } from '@/types/productType'
import { cn } from '@/utils/cn'

const DAYS = [
	['15', '15 días'],
	['30', '30 días'],
	['60', '60 días'],
	['90', '90 días'],
] as const

export function StepWhen({ locations }: { locations: ExchangeLocation[] }) {
	const { register, formState } = useFormContext<ProductForm>()
	const e = formState.errors
	return (
		<>
			<div className='field-pair'>
				<TextField
					id='p-stock'
					label='Existencias'
					hint='Vacío si es un servicio sin cupo.'
					error={e.stock?.message}
					className='num'
					inputMode='numeric'
					placeholder='Sin límite'
					register={register('stock')}
				/>
				<TextField
					id='p-swaps'
					label='Usos por cupón'
					hint='1 para una sola vez; 4 si son cuatro clases.'
					error={e.swaps?.message}
					className='num'
					inputMode='numeric'
					register={register('swaps')}
				/>
			</div>
			<ChipField
				legend='El cupón vale'
				options={DAYS}
				register={register('couponDays')}
			/>
			<div className='field-pair'>
				<TextField
					id='p-from'
					type='date'
					label='Disponible desde (opcional)'
					hint='Vacío: en cuanto RH lo apruebe.'
					error={e.availableFrom?.message}
					register={register('availableFrom')}
				/>
				<TextField
					id='p-until'
					type='date'
					label='Hasta (opcional)'
					hint='Vacío: hasta que lo pauses.'
					error={e.availableUntil?.message}
					register={register('availableUntil')}
				/>
			</div>
			<fieldset className='field'>
				<legend id='p-place-legend'>Se canjea en</legend>
				<div
					className={cn('places', e.locationId && 'animate-nudge')}
					role='radiogroup'
					aria-labelledby='p-place-legend'>
					{locations.map(l => (
						<label key={l.id} className='place-opt'>
							<input type='radio' value={l.id} {...register('locationId')} />
							<span>
								<Icon name='pin' />
								<b>{l.name}</b>
								<small>
									{[
										l.address,
										l.attendantName && `lo atiende ${l.attendantName}`,
									]
										.filter(Boolean)
										.join(' · ') || l.reference}
								</small>
							</span>
						</label>
					))}
				</div>
				<p className={cn('field__help', e.locationId && 'is-error')}>
					{e.locationId?.message ??
						(locations.length
							? 'Donde la persona enseña su cupón.'
							: 'Tu empresa no tiene lugares de canje: pídele a RH que dé de alta uno.')}
				</p>
			</fieldset>
		</>
	)
}
