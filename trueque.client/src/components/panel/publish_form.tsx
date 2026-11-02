import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Combobox } from '@/components/ui/combobox'
import { usePublishProduct } from '@/hooks/panel/use_panel'
import {
	type PublishProductForm,
	publishProductSchema,
} from '@/schemas/panel/publish/publish_product.schema'
import type { ExchangeLocation } from '@/types/product_type'
import { cn } from '@/utils/cn'

import { ArtPicker } from './art_picker'
import { ChipField } from './chip_field'
import { TextField } from './text_field'

const DAYS = [
	['15', '15 días'],
	['30', '30 días'],
	['60', '60 días'],
	['90', '90 días'],
] as const
const KINDS = [
	['service', 'Servicio'],
	['item', 'Artículo'],
] as const

const EMPTY: PublishProductForm = {
	name: '',
	blurb: '',
	detail: '',
	kind: 'item',
	art: 'thermos',
	price: '',
	stock: '',
	couponDays: '30',
	locationId: '',
}

export function PublishForm({
	companyId,
	locations,
}: {
	companyId: string
	locations: ExchangeLocation[]
}) {
	const publish = usePublishProduct()
	const options = useMemo(
		() =>
			locations.map(l => ({
				value: l.id,
				label: l.name,
				description: l.reference ?? undefined,
			})),
		[locations]
	)
	const { register, handleSubmit, control, reset, formState } =
		useForm<PublishProductForm>({
			resolver: zodResolver(publishProductSchema),
			defaultValues: EMPTY,
		})
	const e = formState.errors

	const submit = handleSubmit(v =>
		publish.mutate(
			{
				companyId,
				art: v.art,
				category: v.kind,
				kind: v.kind,
				name: v.name,
				blurb: v.blurb,
				detail: v.detail,
				price: Number(v.price),
				stock: v.stock ? Number(v.stock) : null,
				couponDays: Number(v.couponDays),
				locationId: v.locationId,
			},
			{
				onSuccess: () => {
					toast.success(
						'Mandado a RH: lo verás publicado cuando apruebe el precio'
					)
					reset(EMPTY)
				},
				onError: err => toast.error(err.message),
			}
		)
	)

	return (
		<form className='form-card' noValidate onSubmit={submit}>
			<TextField
				id='p-name'
				label='Nombre'
				hint='Lo que verá la gente en el puesto.'
				error={e.name?.message}
				maxLength={80}
				placeholder='Ej. Gorra bordada del grupo'
				register={register('name')}
			/>
			<TextField
				id='p-blurb'
				label='En una frase'
				hint='Aparece bajo el nombre.'
				error={e.blurb?.message}
				maxLength={140}
				placeholder='Ej. Gorra con el logo bordado.'
				register={register('blurb')}
			/>
			<ChipField legend='Tipo' options={KINDS} register={register('kind')} />
			<ArtPicker register={register} />
			<div className='field-pair'>
				<TextField
					id='p-price'
					label='Precio en cacaos'
					hint='RH lo compara con productos parecidos.'
					error={e.price?.message}
					className='num'
					inputMode='numeric'
					placeholder='35'
					register={register('price')}
				/>
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
			</div>
			<ChipField
				legend='El cupón vale'
				options={DAYS}
				register={register('couponDays')}
			/>
			<div className='field'>
				<label htmlFor='p-location'>Se canjea en</label>
				<Controller
					control={control}
					name='locationId'
					render={({ field, fieldState }) => (
						<Combobox
							id='p-location'
							options={options}
							value={field.value}
							onChange={field.onChange}
							invalid={!!fieldState.error}
							describedBy='p-location-help'
							placeholder='Elige el lugar'
							searchPlaceholder='Busca el lugar'
						/>
					)}
				/>
				<p
					className={cn('field__help', e.locationId && 'is-error')}
					id='p-location-help'>
					{e.locationId?.message ?? 'Donde la persona enseña su cupón.'}
				</p>
			</div>
			<div className='field'>
				<label htmlFor='p-detail'>
					Detalle <span className='muted'>(opcional)</span>
				</label>
				<textarea
					id='p-detail'
					className='input input--area'
					rows={3}
					maxLength={600}
					placeholder='Cómo se canjea, horarios, qué incluye.'
					{...register('detail')}
				/>
			</div>
			<div className='form-card__actions'>
				<button
					className='btn btn--grana'
					type='submit'
					disabled={publish.isPending}>
					{publish.isPending ? (
						<span className='spinner' aria-hidden='true' />
					) : null}
					{publish.isPending ? 'Mandando…' : 'Mandar a RH'}
				</button>
			</div>
		</form>
	)
}
