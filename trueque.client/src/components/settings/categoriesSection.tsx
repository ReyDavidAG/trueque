import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { TextField } from '@/components/panel/textField'
import { Icon } from '@/components/ui/icon'
import { useUpdateCategories } from '@/hooks/config/useConfig'
import {
	type CategoriesForm,
	categoriesSchema,
} from '@/schemas/settings/settings.schema'
import type { CategoryInfo, Product } from '@/types/productType'
import { plural } from '@/utils/plural'

import { NewCategoryForm } from './newCategoryForm'
import { SettingsCard } from './settingsCard'

interface Props {
	categories: CategoryInfo[]
	products: Product[]
}

export function CategoriesSection({ categories, products }: Props) {
	const set = useUpdateCategories()
	const [adding, setAdding] = useState(false)
	const { register, handleSubmit, formState, control } =
		useForm<CategoriesForm>({
			resolver: zodResolver(categoriesSchema),
			defaultValues: {
				categories: categories.map(c => ({
					code: c.code,
					name: c.name,
					min: String(c.priceMin),
					max: String(c.priceMax),
					isActive: c.isActive,
					selfService: c.selfService,
				})),
			},
		})
	const rows = useWatch({ control, name: 'categories' })
	const errors = formState.errors.categories
	const liveIn = (code: string) =>
		products.filter(p => p.category === code && p.status === 'live').length

	const submit = handleSubmit(v =>
		set.mutate(
			v.categories.map(c => ({
				code: c.code,
				patch: {
					name: c.name,
					priceMin: Number(c.min),
					priceMax: Number(c.max),
					isActive: c.isActive,
					selfService: c.selfService,
				},
			})),
			{
				onSuccess: () => toast.success('Categorías guardadas'),
				onError: e => toast.error(e.message),
			}
		)
	)

	return (
		<SettingsCard
			id='categories'
			title='Categorías'
			lede='Qué se ofrece en la despensa y su rango de precio. Una categoría nueva es un renglón; no se borran, se apagan.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			{categories.map((c, i) => {
				const live = liveIn(c.code)
				const turningOff = c.isActive && rows[i] && !rows[i].isActive
				return (
					<div key={c.code} className='category-row'>
						<TextField
							id={`s-name-${c.code}`}
							label='Nombre'
							hint={c.description ?? c.code}
							error={errors?.[i]?.name?.message}
							className='input--sm'
							maxLength={40}
							register={register(`categories.${i}.name`)}
						/>
						<TextField
							id={`s-min-${c.code}`}
							label='Mínimo'
							hint='yemas'
							error={errors?.[i]?.min?.message}
							className='input--sm num'
							inputMode='numeric'
							register={register(`categories.${i}.min`)}
						/>
						<TextField
							id={`s-max-${c.code}`}
							label='Máximo'
							hint='yemas'
							error={errors?.[i]?.max?.message}
							className='input--sm num'
							inputMode='numeric'
							register={register(`categories.${i}.max`)}
						/>
						<div className='category-row__switches'>
							<label className='switch'>
								<input
									type='checkbox'
									{...register(`categories.${i}.isActive`)}
								/>
								<span className='switch__track' aria-hidden='true' />
								<span>Activa</span>
							</label>
							<label className='switch'>
								<input
									type='checkbox'
									{...register(`categories.${i}.selfService`)}
								/>
								<span className='switch__track' aria-hidden='true' />
								<span>Las empresas publican aquí</span>
							</label>
						</div>
						{turningOff && (
							<p className='field__help category-row__note'>
								<Icon name='info' />
								{live
									? `Tiene ${plural(live, 'producto publicado', 'productos publicados')}: siguen en la despensa, pero no entran nuevos.`
									: 'No tiene productos publicados. Dejará de recibir nuevos.'}
							</p>
						)}
					</div>
				)
			})}
			{adding ? (
				<NewCategoryForm
					nextPosition={Math.max(0, ...categories.map(c => c.position)) + 1}
					onDone={() => setAdding(false)}
				/>
			) : (
				<button
					type='button'
					className='btn btn--ghost btn--sm'
					onClick={() => setAdding(true)}>
					<Icon name='plus' />
					Agregar categoría
				</button>
			)}
		</SettingsCard>
	)
}
