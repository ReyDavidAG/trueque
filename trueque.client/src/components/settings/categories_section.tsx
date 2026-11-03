import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { TextField } from '@/components/panel/text_field'
import { useSetCategories } from '@/hooks/config/use_config'
import {
	type CategoriesForm,
	categoriesSchema,
} from '@/schemas/settings/settings.schema'
import type { CategoryInfo } from '@/types/product_type'

import { SettingsCard } from './settings_card'

export function CategoriesSection({
	categories,
}: {
	categories: CategoryInfo[]
}) {
	const set = useSetCategories()
	const { register, handleSubmit, formState } = useForm<CategoriesForm>({
		resolver: zodResolver(categoriesSchema),
		defaultValues: {
			categories: categories.map(c => ({
				code: c.code,
				min: String(c.priceMin),
				max: String(c.priceMax),
			})),
		},
	})
	const errors = formState.errors.categories
	const submit = handleSubmit(v =>
		set.mutate(
			v.categories.map(c => ({
				code: c.code,
				min: Number(c.min),
				max: Number(c.max),
			})),
			{
				onSuccess: () => toast.success('Rangos de precio guardados'),
				onError: e => toast.error(e.message),
			}
		)
	)
	return (
		<SettingsCard
			id='categories'
			title='Rangos de precio'
			lede='Lo mínimo y máximo que puede costar algo en cada categoría.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			{categories.map((c, i) => (
				<div key={c.code} className='field-row'>
					<b className='field-row__label'>{c.name}</b>
					<TextField
						id={`s-min-${c.code}`}
						label='Mínimo'
						hint='cacaos'
						error={errors?.[i]?.min?.message}
						className='input--sm num'
						inputMode='numeric'
						register={register(`categories.${i}.min`)}
					/>
					<TextField
						id={`s-max-${c.code}`}
						label='Máximo'
						hint='cacaos'
						error={errors?.[i]?.max?.message}
						className='input--sm num'
						inputMode='numeric'
						register={register(`categories.${i}.max`)}
					/>
				</div>
			))}
		</SettingsCard>
	)
}
