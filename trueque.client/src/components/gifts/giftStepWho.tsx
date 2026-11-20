import {
	Controller,
	type UseFieldArrayReturn,
	useFormContext,
} from 'react-hook-form'

import { ChipField } from '@/components/panel/chipField'
import { Combobox } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { GRANT_SCOPES } from '@/constants/grants'
import type { GrantForm } from '@/schemas/grants/grant.schema'
import type { GrantScopes } from '@/types/grantType'

import { GiftListRows } from './giftListRows'

interface Props {
	scopes: GrantScopes
	list: UseFieldArrayReturn<GrantForm, 'list'>
	maxList: number
	defaultAmount: string
}

export function GiftStepWho({ scopes, list, maxList, defaultAmount }: Props) {
	const { register, control, watch, formState } = useFormContext<GrantForm>()
	const scope = watch('scope')
	const e = formState.errors
	const companyName = new Map(scopes.companies.map(c => [c.id, c.name]))
	const areaName = new Map(scopes.areas.map(a => [a.id, a.name]))
	const options =
		scope === 'company'
			? scopes.companies.map(c => ({ value: c.id, label: c.name }))
			: scope === 'area'
				? scopes.areas.map(a => ({
						value: a.id,
						label: a.name,
						description: companyName.get(a.parentId ?? ''),
					}))
				: scopes.departments.map(d => ({
						value: d.id,
						label: d.name,
						description: areaName.get(d.parentId ?? ''),
					}))

	return (
		<>
			<ChipField
				legend='A quién'
				options={GRANT_SCOPES}
				register={register('scope')}
			/>
			{scope !== 'group' && scope !== 'list' && (
				<div className='field'>
					<label htmlFor='g-scope-id'>
						{GRANT_SCOPES.find(([v]) => v === scope)?.[1]}
					</label>
					<Controller
						control={control}
						name='scopeId'
						render={({ field }) => (
							<Combobox
								id='g-scope-id'
								options={options}
								value={field.value}
								onChange={field.onChange}
								placeholder='Elige…'
								invalid={Boolean(e.scopeId)}
								describedBy='g-scope-id-help'
							/>
						)}
					/>
					<p
						className={e.scopeId ? 'field__help is-error' : 'field__help'}
						id='g-scope-id-help'>
						{e.scopeId?.message ?? 'Sólo cuentan las personas activas.'}
					</p>
				</div>
			)}
			{scope === 'list' && (
				<>
					<GiftListRows list={list} />
					{e.list?.message && (
						<p className='field__help is-error'>{e.list.message}</p>
					)}
					<button
						type='button'
						className='btn btn--ghost btn--sm'
						disabled={list.fields.length >= maxList}
						onClick={() =>
							list.append({
								employeeNumber: '',
								amount: defaultAmount,
								note: '',
							})
						}>
						<Icon name='plus' />
						Agregar persona
					</button>
				</>
			)}
		</>
	)
}
