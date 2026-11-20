import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { TextField } from '@/components/panel/textField'
import { FigurePicker } from '@/components/product_form/look/figurePicker'
import { useCreateCategory } from '@/hooks/config/useConfig'
import { useFigureFilter } from '@/hooks/panel/useFigureFilter'
import {
	type NewCategoryForm as Values,
	newCategorySchema,
} from '@/schemas/settings/settings.schema'

interface Props {
	nextPosition: number
	onDone: () => void
}

export function NewCategoryForm({ nextPosition, onDone }: Props) {
	const create = useCreateCategory()
	const filter = useFigureFilter()
	const { register, handleSubmit, formState, control, setValue } =
		useForm<Values>({
			resolver: zodResolver(newCategorySchema),
			defaultValues: {
				code: '',
				name: '',
				min: '',
				max: '',
				description: '',
				selfService: true,
				art: '',
			},
		})
	const art = useWatch({ control, name: 'art' })
	const e = formState.errors

	const save = handleSubmit(v =>
		create.mutate(
			{
				code: v.code,
				name: v.name,
				priceMin: Number(v.min),
				priceMax: Number(v.max),
				position: nextPosition,
				description: v.description || null,
				selfService: v.selfService,
				art: v.art || null,
			},
			{
				onSuccess: () => {
					toast.success('Categoría agregada')
					onDone()
				},
				onError: err => toast.error(err.message),
			}
		)
	)

	return (
		<div className='new-category' role='group' aria-label='Categoría nueva'>
			<div className='field-pair'>
				<TextField
					id='nc-name'
					label='Nombre'
					hint='Como se verá en los chips de la despensa.'
					error={e.name?.message}
					maxLength={40}
					register={register('name')}
				/>
				<TextField
					id='nc-code'
					label='Clave'
					hint='Minúsculas y guion bajo. No se cambia después.'
					error={e.code?.message}
					maxLength={30}
					className='num'
					register={register('code')}
				/>
			</div>
			<div className='field-pair'>
				<TextField
					id='nc-min'
					label='Mínimo'
					hint='yemas'
					error={e.min?.message}
					className='num'
					inputMode='numeric'
					register={register('min')}
				/>
				<TextField
					id='nc-max'
					label='Máximo'
					hint='yemas'
					error={e.max?.message}
					className='num'
					inputMode='numeric'
					register={register('max')}
				/>
			</div>
			<TextField
				id='nc-description'
				label='Qué entra aquí'
				hint='Una frase corta. Hasta 160 caracteres.'
				error={e.description?.message}
				maxLength={160}
				register={register('description')}
			/>
			<label className='switch'>
				<input type='checkbox' {...register('selfService')} />
				<span className='switch__track' aria-hidden='true' />
				<span>Las empresas publican aquí</span>
			</label>
			<FigurePicker
				selectedRef={art}
				stall='anil'
				filter={filter}
				onPick={ref => setValue('art', ref, { shouldDirty: true })}
			/>
			<div className='form-card__actions'>
				<button type='button' className='btn btn--ghost' onClick={onDone}>
					Cancelar
				</button>
				<button
					type='button'
					className='btn btn--grana'
					disabled={create.isPending}
					onClick={() => void save()}>
					{create.isPending && <span className='spinner' aria-hidden='true' />}
					Agregar
				</button>
			</div>
		</div>
	)
}
