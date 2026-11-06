import { type FormEvent, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { AsteroidsGame } from '@/components/redeem/asteroidsGame'
import { CouponPreview } from '@/components/redeem/couponPreview'
import { EggGuest } from '@/components/redeem/eggGuest'
import { ScanBox } from '@/components/redeem/scanBox'
import { Icon } from '@/components/ui/icon'
import { eggFor, type EggKind } from '@/constants/easterEggs'
import { ROUTES } from '@/constants/routes'
import { useCouponLookup, useRedeem } from '@/hooks/panel/usePanel'
import {
	type RedeemCouponForm,
	redeemCouponSchema,
} from '@/schemas/panel/redeem/redeemCoupon.schema.ts'
import type { CouponLookup } from '@/types/configType'
import { cn } from '@/utils/cn'

export default function RedeemPage() {
	const lookup = useCouponLookup()
	const redeem = useRedeem()
	const [coupon, setCoupon] = useState<CouponLookup | null>(null)
	const [done, setDone] = useState(false)
	const [egg, setEgg] = useState<EggKind | null>(null)
	const {
		register,
		handleSubmit,
		setValue,
		setError,
		reset,
		getValues,
		formState,
	} = useForm<RedeemCouponForm>({
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

	const playEgg = useCallback(
		(raw: string) => {
			const kind = eggFor(raw)
			if (!kind) return false
			reset({ code: '' })
			setCoupon(null)
			setEgg(kind)
			return true
		},
		[reset]
	)

	const onScan = useCallback(
		(raw: string) => {
			if (playEgg(raw)) return
			setValue('code', raw.trim().toUpperCase())
			void handleSubmit(v => find(v.code))()
		},
		[find, handleSubmit, setValue, playEgg]
	)

	const submit = (e: FormEvent<HTMLFormElement>) => {
		if (playEgg(getValues('code'))) return e.preventDefault()
		void handleSubmit(v => find(v.code))(e)
	}

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
			<ol className='booth-steps' role='list'>
				<li className={cn(!coupon && 'is-on')}>
					<b>1</b>Escanea o escribe
				</li>
				<li className={cn(coupon && !done && 'is-on')}>
					<b>2</b>Revisa para quién es
				</li>
				<li className={cn(done && 'is-on')}>
					<b>3</b>Confirma y rómpelo
				</li>
			</ol>
			<form className='booth' noValidate onSubmit={submit}>
				<div className='stall__awning booth__awning' aria-hidden='true' />
				<div className='booth__window'>
					{egg === 'asteroids' ? (
						<AsteroidsGame onExit={() => setEgg(null)} />
					) : (
						<ScanBox onCode={onScan} />
					)}
				</div>
				<p className='booth__or' aria-hidden='true'>
					<span>o</span>
				</p>
				<div className='field booth__ticket'>
					<label htmlFor='r-code' className='booth__label'>
						Escribe el código del cupón
					</label>
					<div className='field-inline'>
						<input
							id='r-code'
							className={cn(
								'input num input--code booth__input',
								error && 'animate-nudge'
							)}
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
				{(egg === 'cat' || egg === 'skeleton') && (
					<EggGuest kind={egg} onClose={() => setEgg(null)} />
				)}
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
