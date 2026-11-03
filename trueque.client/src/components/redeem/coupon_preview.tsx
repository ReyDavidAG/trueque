import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import type { CouponLookup } from '@/types/config_type'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

function problem(c: CouponLookup): [string, string, string] | null {
	if (c.state === 'used')
		return [
			'is-used',
			'Este cupón ya se usó',
			'No entregues nada: ya se canjeó.',
		]
	if (c.state !== 'valid')
		return [
			'is-rejected',
			'Este cupón ya venció',
			`Valía hasta el ${shortDate(c.validUntil)}. La persona puede hacer otro trueque.`,
		]
	if (!c.canRedeem)
		return [
			'is-other',
			'Este cupón es de otro puesto',
			'Lo canjea la empresa que ofrece el producto.',
		]
	return null
}

interface Props {
	coupon: CouponLookup
	done: boolean
	busy: boolean
	onConfirm: () => void
	onClear: () => void
}

export function CouponPreview({
	coupon: c,
	done,
	busy,
	onConfirm,
	onClear,
}: Props) {
	const bad = problem(c)
	if (done)
		return (
			<article
				className='redeem-card is-done animate-tile-in'
				data-stall={c.productStall}
				aria-live='polite'>
				<div className='redeem-card__art'>
					<span className='done-head__mark'>
						<Icon name='check' />
					</span>
				</div>
				<div className='redeem-card__body'>
					<p className='kicker num'>{c.folio}</p>
					<h2 className='h3'>Canje registrado</h2>
					<p className='muted'>
						{c.productName} para {c.personName}. Se descontaron{' '}
						{formatMoney(c.productCost)} del presupuesto de tu empresa.
					</p>
					<button
						className='btn btn--grana btn--block'
						type='button'
						onClick={onClear}>
						Canjear otro
					</button>
				</div>
			</article>
		)
	return (
		<article
			className={cn('redeem-card animate-tile-in', bad ? bad[0] : 'is-ok')}
			data-stall={c.productStall}
			aria-live='polite'>
			<div className='redeem-card__art'>
				<Art id={c.productArt} />
			</div>
			<div className='redeem-card__body'>
				<p className='kicker num'>
					{c.folio} · {c.code}
				</p>
				<h2 className='h3'>{c.productName}</h2>
				<dl className='facts facts--tight'>
					<div>
						<dt>Para</dt>
						<dd>
							{c.personName} · No.{' '}
							<span className='num'>{c.employeeNumber}</span>
						</dd>
					</div>
					<div>
						<dt>Vale hasta</dt>
						<dd>{shortDate(c.validUntil)}</dd>
					</div>
					<div>
						<dt>Costo para tu empresa</dt>
						<dd>{formatMoney(c.productCost)}</dd>
					</div>
				</dl>
				{bad ? (
					<>
						<p className='redeem-card__alert' role='alert'>
							<Icon name='info' />
							<span>
								<b>{bad[1]}</b>
								{bad[2]}
							</span>
						</p>
						<button
							className='btn btn--ghost btn--block'
							type='button'
							onClick={onClear}>
							Buscar otro código
						</button>
					</>
				) : (
					<>
						<p className='redeem-card__ok'>
							<Icon name='check' />
							<span>
								<b>Todo en orden.</b>Entrega el producto y confirma.
							</span>
						</p>
						<button
							className='btn btn--grana btn--lg btn--block'
							type='button'
							disabled={busy}
							onClick={onConfirm}>
							{busy ? (
								<span className='spinner' aria-hidden='true' />
							) : (
								<Icon name='check' />
							)}
							Confirmar canje
						</button>
						<button
							className='btn btn--ghost btn--block'
							type='button'
							onClick={onClear}>
							Cancelar
						</button>
					</>
				)}
			</div>
		</article>
	)
}
