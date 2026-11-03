import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { CouponPreview } from '@/components/redeem/coupon_preview'
import { ScanBox } from '@/components/redeem/scan_box'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useCouponLookup, useRedeem } from '@/hooks/panel/use_panel'
import {
	type RedeemCouponForm,
	redeemCouponSchema,
} from '@/schemas/panel/redeem/redeem_coupon.schema'
import type { CouponLookup } from '@/types/config_type'
import { cn } from '@/utils/cn'

export default function RedeemPage() {
	const lookup = useCouponLookup()
	const redeem = useRedeem()
	const [coupon, setCoupon] = useState<CouponLookup | null>(null)
	const [done, setDone] = useState(false)
	const { register, handleSubmit, setValue, setError, reset, formState } =
		useForm<RedeemCouponForm>({
			resolver: zodResolver(redeemCouponSchema),
			defaultValues: { code: '' },
		})
	const error = formState.errors.code?.message

	const find = useCallback(
		(code: string) => {
			setDone(false)
			lookup.mutate(code, {
				onSuccess: c => {
					setCoupon(c)
					if (!c)
						setError('code', {
							message:
								'No encontramos ese código. Revisa que esté bien escrito.',
						})
				},
				onError: e => toast.error(e.message),
			})
		},
		[lookup, setError]
	)

	const onScan = useCallback(
		(raw: string) => {
			setValue('code', raw.trim().toUpperCase())
			void handleSubmit(v => find(v.code))()
		},
		[find, handleSubmit, setValue]
	)

	const confirm = () => {
		if (!coupon) return
		redeem.mutate(
			{ code: coupon.code, locationId: null },
			{
				onSuccess: () => {
					setDone(true)
					toast.success(`Canjeado: ${coupon.productName}`)
				},
				onError: e => toast.error(e.message),
			}
		)
	}

	const clear = () => {
		setCoupon(null)
		setDone(false)
		reset({ code: '' })
	}

	return (
		<div className='wrap narrow'>
			<Link className='back-link' to={ROUTES.panel}>
				<Icon name='arrowLeft' />
				Tu puesto
			</Link>
			<header className='page-head'>
				<h1 className='h1'>Canjear un cupón</h1>
				<p className='lede'>
					Escanea el QR o escribe el código. Antes de confirmar ves para quién
					es y si todavía vale.
				</p>
			</header>
			<form
				className='form-card'
				noValidate
				onSubmit={handleSubmit(v => find(v.code))}>
				<ScanBox onCode={onScan} />
				<div className='field'>
					<label htmlFor='r-code'>O escribe el código</label>
					<div className='field-inline'>
						<input
							id='r-code'
							className={cn('input num input--code', error && 'animate-nudge')}
							autoComplete='off'
							spellCheck={false}
							placeholder='CAC-XXXX0000'
							aria-invalid={Boolean(error)}
							aria-describedby='r-code-help'
							{...register('code')}
						/>
						<button
							className='btn btn--grana'
							type='submit'
							disabled={lookup.isPending}>
							{lookup.isPending ? (
								<span className='spinner' aria-hidden='true' />
							) : (
								'Buscar'
							)}
						</button>
					</div>
					<p
						className={cn('field__help', error && 'is-error')}
						id='r-code-help'>
						{error ?? 'Empieza con CAC- y está debajo del QR.'}
					</p>
				</div>
			</form>
			{coupon && (
				<CouponPreview
					coupon={coupon}
					done={done}
					busy={redeem.isPending}
					onConfirm={confirm}
					onClear={clear}
				/>
			)}
		</div>
	)
}
