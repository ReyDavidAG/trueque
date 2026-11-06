import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useSetConfig } from '@/hooks/config/useConfig'
import {
	type ExpiryForm,
	expirySchema,
} from '@/schemas/settings/settings.schema'
import type { StoreConfig } from '@/types/configType'
import { cn } from '@/utils/cn'

import { SettingsCard } from './settingsCard'

export function ExpirySection({ config }: { config: StoreConfig }) {
	const set = useSetConfig()
	const { register, handleSubmit, formState } = useForm<ExpiryForm>({
		resolver: zodResolver(expirySchema),
		defaultValues: {
			lotMonths: String(config.lotMonths),
			refundOnExpiry: config.refundOnExpiry,
		},
	})
	const error = formState.errors.lotMonths?.message
	const submit = handleSubmit(v =>
		set.mutate(
			{ lotMonths: Number(v.lotMonths), refundOnExpiry: v.refundOnExpiry },
			{
				onSuccess: () => toast.success('Vencimiento actualizado'),
				onError: e => toast.error(e.message),
			}
		)
	)
	return (
		<SettingsCard
			id='expiry'
			title='Vencimiento'
			lede='Para que los cacaos se usen y la empresa no acumule una deuda que nunca se canjea.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			<div className='field'>
				<label htmlFor='s-months'>Los cacaos vencen a los</label>
				<span className='input-affix input-affix--end'>
					<input
						id='s-months'
						className={cn('input num', error && 'animate-nudge')}
						inputMode='numeric'
						aria-invalid={Boolean(error)}
						aria-describedby='s-months-help'
						{...register('lotMonths')}
					/>
					<span>meses</span>
				</span>
				<p
					className={cn('field__help', error && 'is-error')}
					id='s-months-help'>
					{error ??
						'Desde que se ganan. Entre 1 y 60. Aplica a lo que se gane de aquí en adelante.'}
				</p>
			</div>
			<label className='switch'>
				<input type='checkbox' {...register('refundOnExpiry')} />
				<span className='switch__track' aria-hidden='true' />
				<span>Devolver los cacaos si un cupón vence sin usarse</span>
			</label>
		</SettingsCard>
	)
}
