import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useSetRules } from '@/hooks/config/use_config'
import { type RulesForm, rulesSchema } from '@/schemas/settings/settings.schema'
import type { EarningRule } from '@/types/wallet_type'

import { SettingsCard } from './settings_card'

const SOURCE = { chispa: 'Chispa', insignias: 'Insignias', rh: 'RH' } as const

export function RulesSection({ rules }: { rules: EarningRule[] }) {
	const set = useSetRules()
	const { register, handleSubmit, formState } = useForm<RulesForm>({
		resolver: zodResolver(rulesSchema),
		defaultValues: {
			rules: rules.map(r => ({
				code: r.code,
				cacaos: String(r.cacaos),
				monthlyCap: r.monthlyCap ? String(r.monthlyCap) : '',
				isActive: r.isActive,
			})),
		},
	})
	const firstError = formState.errors.rules?.find?.(Boolean)
	const message = firstError?.cacaos?.message ?? firstError?.monthlyCap?.message
	const submit = handleSubmit(v =>
		set.mutate(
			v.rules.map((r, i) => ({
				code: r.code,
				...(rules[i].isVariable ? {} : { cacaos: Number(r.cacaos) }),
				monthlyCap: r.monthlyCap === '' ? null : Number(r.monthlyCap),
				isActive: r.isActive,
			})),
			{
				onSuccess: () => toast.success('Reglas de ganancia guardadas'),
				onError: e => toast.error(e.message),
			}
		)
	)
	return (
		<SettingsCard
			id='rules'
			title='Cómo se ganan'
			lede='Cuánto da cada acción y cuántas veces al mes cuenta. Una fuente nueva es una fila nueva.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			<div className='table-wrap'>
				<table className='rules-table'>
					<thead>
						<tr>
							<th scope='col'>Acción</th>
							<th scope='col'>Cacaos</th>
							<th scope='col'>
								Tope al mes<small>vacío = sin tope</small>
							</th>
							<th scope='col'>Activa</th>
						</tr>
					</thead>
					<tbody>
						{rules.map((r, i) => (
							<tr key={r.code}>
								<th scope='row'>
									<b>{r.label}</b>
									<small>
										{SOURCE[r.source]}
										{r.note && ` · ${r.note}`}
									</small>
								</th>
								<td>
									{r.isVariable ? (
										<span className='muted small'>Según la insignia</span>
									) : (
										<input
											className='input input--sm num'
											inputMode='numeric'
											aria-label={`Cacaos por ${r.label}`}
											{...register(`rules.${i}.cacaos`)}
										/>
									)}
								</td>
								<td>
									<input
										className='input input--sm num'
										inputMode='numeric'
										placeholder='—'
										aria-label={`Tope al mes de ${r.label}`}
										{...register(`rules.${i}.monthlyCap`)}
									/>
								</td>
								<td>
									<label className='switch switch--solo'>
										<input
											type='checkbox'
											aria-label={`Activa: ${r.label}`}
											{...register(`rules.${i}.isActive`)}
										/>
										<span className='switch__track' aria-hidden='true' />
									</label>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{message && <p className='field__help is-error'>{message}</p>}
		</SettingsCard>
	)
}
