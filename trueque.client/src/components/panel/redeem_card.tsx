import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Combobox } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { useRedeem } from '@/hooks/panel/use_panel'
import {
	type RedeemCouponForm,
	redeemCouponSchema,
} from '@/schemas/panel/redeem/redeem_coupon.schema'
import type { ExchangeLocation } from '@/types/product_type'
import { cn } from '@/utils/cn'

export function RedeemCard({ locations }: { locations: ExchangeLocation[] }) {
	const redeem = useRedeem()
	const options = useMemo(
		() =>
			locations.map(l => ({
				value: l.id,
				label: l.name,
				description: l.reference ?? undefined,
			})),
		[locations]
	)
	const { register, handleSubmit, control, reset, formState } =
		useForm<RedeemCouponForm>({
			resolver: zodResolver(redeemCouponSchema),
			defaultValues: { code: '', locationId: '' },
		})
	const error = formState.errors.code?.message

	const submit = handleSubmit(v =>
		redeem.mutate(
			{ code: v.code, locationId: v.locationId || null },
			{
				onSuccess: state => {
					toast.success(
						state === 'used'
							? 'Cupón canjeado: entrega el producto'
							: 'Canje registrado; al cupón le quedan canjes'
					)
					reset({ code: '', locationId: v.locationId })
				},
				onError: e => toast.error(e.message),
			}
		)
	)

	return (
		<form className='card stack redeem' noValidate onSubmit={submit}>
			<h2 className='h4'>
				<Icon name='ticket' />
				Canjear un cupón
			</h2>
			<div className='field'>
				<label htmlFor='code'>Código del cupón</label>
				<input
					id='code'
					className={cn('input num', error && 'animate-nudge')}
					placeholder='CAC-…'
					autoComplete='off'
					aria-invalid={Boolean(error)}
					aria-describedby='code-help'
					{...register('code')}
				/>
				<p className={cn('field__help', error && 'is-error')} id='code-help'>
					{error ?? 'Lo trae la persona en su cupón, abajo del QR.'}
				</p>
			</div>
			<div className='field'>
				<label htmlFor='redeem-location'>Lugar de canje</label>
				<Controller
					control={control}
					name='locationId'
					render={({ field }) => (
						<Combobox
							id='redeem-location'
							options={options}
							value={field.value}
							onChange={field.onChange}
							placeholder='Elige el lugar'
							clearLabel='Sin lugar'
							searchPlaceholder='Busca el lugar'
						/>
					)}
				/>
			</div>
			<button
				className='btn btn--grana'
				type='submit'
				disabled={redeem.isPending}>
				{redeem.isPending ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					<Icon name='check' />
				)}
				{redeem.isPending ? 'Canjeando…' : 'Canjear'}
			</button>
		</form>
	)
}
