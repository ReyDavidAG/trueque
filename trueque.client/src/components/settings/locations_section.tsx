import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { TextField } from '@/components/panel/text_field'
import { Combobox } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { useSaveLocation } from '@/hooks/config/use_config'
import {
	type LocationForm,
	locationSchema,
} from '@/schemas/settings/settings.schema'
import type { Company } from '@/types/panel_type'
import type { ExchangeLocation } from '@/types/product_type'
import { cn } from '@/utils/cn'

import { SettingsCard } from './settings_card'

const EMPTY: LocationForm = {
	companyId: '',
	name: '',
	address: '',
	reference: '',
}

export function LocationsSection({
	locations,
	companies,
}: {
	locations: ExchangeLocation[]
	companies: Company[]
}) {
	const save = useSaveLocation()
	const [adding, setAdding] = useState(false)
	const names = useMemo(
		() => new Map(companies.map(c => [c.id, c.name])),
		[companies]
	)
	const options = useMemo(
		() =>
			companies.map(c => ({ value: c.id, label: c.name, description: c.code })),
		[companies]
	)
	const { register, handleSubmit, control, reset, formState } =
		useForm<LocationForm>({
			resolver: zodResolver(locationSchema),
			defaultValues: EMPTY,
		})
	const e = formState.errors
	const submit = handleSubmit(v =>
		save.mutate(
			{ id: null, ...v },
			{
				onSuccess: () => {
					toast.success('Lugar agregado')
					reset(EMPTY)
					setAdding(false)
				},
				onError: err => toast.error(err.message),
			}
		)
	)
	return (
		<SettingsCard
			id='locations'
			title='Lugares de canje'
			lede='Dónde se enseñan los cupones y quién los escanea.'
			busy={save.isPending}
			action={adding ? 'Agregar lugar' : null}
			onSubmit={ev => (adding ? void submit(ev) : ev.preventDefault())}>
			<ul className='locations' role='list'>
				{locations.map(l => (
					<li key={l.id}>
						<Icon name='pin' />
						<span>
							<b>{l.name}</b>
							{[names.get(l.companyId), l.address].filter(Boolean).join(' · ')}
							<small>
								{l.attendantName
									? `Lo atiende ${l.attendantName}`
									: 'Lo canjea el encargado de la tienda'}
								{l.reference && ` · ${l.reference}`}
							</small>
						</span>
					</li>
				))}
			</ul>
			{adding ? (
				<div className='stack animate-panel-in'>
					<button
						className='link-btn'
						type='button'
						onClick={() => setAdding(false)}>
						Cancelar
					</button>
					<div className='field'>
						<label htmlFor='s-l-company'>Empresa</label>
						<Controller
							control={control}
							name='companyId'
							render={({ field, fieldState }) => (
								<Combobox
									id='s-l-company'
									options={options}
									value={field.value}
									onChange={field.onChange}
									invalid={!!fieldState.error}
									describedBy='s-l-company-help'
									placeholder='Elige la empresa'
									searchPlaceholder='Busca la empresa'
								/>
							)}
						/>
						<p
							className={cn('field__help', e.companyId && 'is-error')}
							id='s-l-company-help'>
							{e.companyId?.message ?? 'La que paga lo que se canjea aquí.'}
						</p>
					</div>
					<div className='field-pair'>
						<TextField
							id='s-l-name'
							label='Nombre'
							hint='Como lo conoce la gente.'
							error={e.name?.message}
							maxLength={80}
							register={register('name')}
						/>
						<TextField
							id='s-l-address'
							label='Dirección'
							hint='Planta, edificio o calle.'
							error={e.address?.message}
							maxLength={90}
							register={register('address')}
						/>
					</div>
					<TextField
						id='s-l-reference'
						label='Referencia'
						hint='Cómo encontrarlo o qué llevar.'
						error={e.reference?.message}
						maxLength={90}
						register={register('reference')}
					/>
				</div>
			) : (
				<button
					className='btn btn--ghost btn--sm'
					type='button'
					onClick={() => setAdding(true)}>
					<Icon name='plus' />
					Agregar lugar
				</button>
			)}
		</SettingsCard>
	)
}
