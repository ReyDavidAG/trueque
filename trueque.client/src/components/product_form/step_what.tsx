import { useFormContext } from 'react-hook-form'

import { ChipField } from '@/components/panel/chip_field'
import { TextField } from '@/components/panel/text_field'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { CategoryInfo } from '@/types/product_type'

import { AreaField } from './area_field'

const KINDS = [
	['service', 'Servicio'],
	['item', 'Artículo'],
] as const

export function StepWhat({ categories }: { categories: CategoryInfo[] }) {
	const { register, formState } = useFormContext<ProductForm>()
	const e = formState.errors
	const cats = categories
		.filter(c => c.code !== 'custodia')
		.map(c => [c.code, c.name] as const)
	return (
		<>
			<TextField
				id='p-name'
				label='Nombre'
				hint='Lo primero que verá la gente en el puesto. De 4 a 80 letras.'
				error={e.name?.message}
				maxLength={80}
				placeholder='Ej. Consulta con nutrióloga'
				register={register('name')}
			/>
			<TextField
				id='p-blurb'
				label='En una frase'
				hint='Aparece bajo el nombre. Que se entienda qué recibe.'
				error={e.blurb?.message}
				maxLength={140}
				placeholder='Ej. Valoración y plan de alimentación.'
				register={register('blurb')}
			/>
			<div className='field-pair'>
				<ChipField legend='Tipo' options={KINDS} register={register('kind')} />
				<ChipField
					legend='Categoría'
					options={cats}
					register={register('category')}
				/>
			</div>
			<AreaField
				id='p-includes'
				label='Qué incluye'
				optional
				hint='Una cosa por renglón; se muestra como lista con palomitas.'
				error={e.includes?.message}
				placeholder='Una cosa por renglón'
				register={register('includes')}
			/>
			<AreaField
				id='p-detail'
				label='Cómo se canjea'
				optional
				hint='Lo que la persona necesita saber antes de ir.'
				error={e.detail?.message}
				maxLength={600}
				placeholder='Horarios, citas, qué llevar.'
				register={register('detail')}
			/>
		</>
	)
}
