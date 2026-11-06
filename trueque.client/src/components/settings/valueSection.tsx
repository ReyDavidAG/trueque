import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { useSetConfig } from '@/hooks/config/useConfig'
import { type ValueForm, valueSchema } from '@/schemas/settings/settings.schema'
import type { Product } from '@/types/productType'
import type { EarningRule } from '@/types/walletType'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

import { SettingsCard } from './settingsCard'

interface Props {
	cacaoValue: number
	rules: EarningRule[]
	products: Product[]
}

export function ValueSection({ cacaoValue, rules, products }: Props) {
	const set = useSetConfig()
	const { register, handleSubmit, control, formState } = useForm<ValueForm>({
		resolver: zodResolver(valueSchema),
		defaultValues: { cacaoValue: String(cacaoValue) },
	})
	const raw = Number(useWatch({ control, name: 'cacaoValue' }))
	const value = raw > 0 ? raw : cacaoValue
	const done = rules.find(r => r.code === 'done')
	const far = products.filter(
		p =>
			p.status === 'live' &&
			p.cost > 0 &&
			Math.abs(p.price - p.cost / value) / (p.cost / value) > 0.2
	).length
	const error = formState.errors.cacaoValue?.message
	const submit = handleSubmit(v =>
		set.mutate(
			{ cacaoValue: Number(v.cacaoValue) },
			{
				onSuccess: () => toast.success('Valor del cacao actualizado'),
				onError: e => toast.error(e.message),
			}
		)
	)
	return (
		<SettingsCard
			id='value'
			title='Valor del cacao'
			lede='La equivalencia que usa todo el sistema para sugerir precios y mostrar costos.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			<div className='field'>
				<label htmlFor='s-value'>Pesos por cacao</label>
				<span className='input-affix'>
					<span>$</span>
					<input
						id='s-value'
						className={cn('input num', error && 'animate-nudge')}
						inputMode='decimal'
						aria-invalid={Boolean(error)}
						aria-describedby='s-value-help'
						{...register('cacaoValue')}
					/>
				</span>
				<p className={cn('field__help', error && 'is-error')} id='s-value-help'>
					{error ??
						'Con esto se sugiere el precio de cada producto (su costo entre este valor) y se muestra cuánto vale un cacao.'}
				</p>
			</div>
			<div className='impact'>
				{done && (
					<p>
						<Coin />
						Una chispa implementada ({cacaos(done.cacaos)}) equivale a{' '}
						<b>{formatMoney(done.cacaos * value)}</b>.
					</p>
				)}
				<p className={cn(far > 0 && 'is-warn')}>
					<Icon name={far ? 'info' : 'check'} />
					{far
						? `${far} productos publicados quedarían lejos de su precio sugerido (más de 20%). Conviene revisarlos.`
						: 'Los precios publicados siguen cerca de lo sugerido.'}
				</p>
			</div>
		</SettingsCard>
	)
}
