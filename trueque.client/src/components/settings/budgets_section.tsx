import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useSetBudgets } from '@/hooks/config/use_config'
import {
	type BudgetsForm,
	budgetsSchema,
} from '@/schemas/settings/settings.schema'
import type { Budget, Company } from '@/types/panel_type'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

import { SettingsCard } from './settings_card'

export function BudgetsSection({
	companies,
	budgets,
	year,
}: {
	companies: Company[]
	budgets: Budget[]
	year: number
}) {
	const set = useSetBudgets()
	const rows = companies.map(c => {
		const b = budgets.find(x => x.companyId === c.id && x.period === year)
		return {
			company: c,
			used: b ? b.redeemed + b.committed : 0,
			assigned: b?.assigned ?? 0,
		}
	})
	const { register, handleSubmit, formState } = useForm<BudgetsForm>({
		resolver: zodResolver(budgetsSchema),
		defaultValues: {
			budgets: rows.map(r => ({
				companyId: r.company.id,
				used: r.used,
				assigned: String(Math.round(r.assigned)),
			})),
		},
	})
	const errors = formState.errors.budgets
	const submit = handleSubmit(v =>
		set.mutate(
			v.budgets.map(b => ({
				companyId: b.companyId,
				period: year,
				assigned: Number(b.assigned),
			})),
			{
				onSuccess: () => toast.success('Presupuestos guardados'),
				onError: e => toast.error(e.message),
			}
		)
	)
	return (
		<SettingsCard
			id='budgets'
			title='Presupuesto por empresa'
			lede='Cada empresa paga, con el costo real, lo que su puesto entrega.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			{rows.map((r, i) => {
				const error = errors?.[i]?.assigned?.message
				return (
					<div key={r.company.id} className='field-row'>
						<b className='field-row__label'>
							{r.company.name}
							<small>
								Usado: {formatMoney(r.used)}
								{r.assigned > 0 &&
									` (${Math.round((r.used / r.assigned) * 100)}%)`}
							</small>
						</b>
						<div className='field'>
							<label htmlFor={`s-b-${r.company.id}`}>Presupuesto {year}</label>
							<span className='input-affix'>
								<span>$</span>
								<input
									id={`s-b-${r.company.id}`}
									className={cn('input num', error && 'animate-nudge')}
									inputMode='numeric'
									aria-invalid={Boolean(error)}
									{...register(`budgets.${i}.assigned`)}
								/>
							</span>
							<p className={cn('field__help', error && 'is-error')}>
								{error ?? 'En pesos, para todo el año.'}
							</p>
						</div>
					</div>
				)
			})}
		</SettingsCard>
	)
}
