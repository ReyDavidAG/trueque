import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useLots } from '@/hooks/wallet/useWallet'
import type { Product } from '@/types/productType'
import type { Lot } from '@/types/walletType'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { daysUntil, shortDate } from '@/utils/dates'

interface Props {
	product: Product
	balance: number
	cacaoValue: number
}

function plan(lots: Lot[], price: number) {
	const steps: { lot: Lot; take: number }[] = []
	let due = price
	const usable = lots
		.filter(l => l.remaining > 0 && daysUntil(l.expiresOn) >= 0)
		.sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))
	for (const lot of usable) {
		if (due <= 0) break
		const take = Math.min(due, lot.remaining)
		steps.push({ lot, take })
		due -= take
	}
	return steps
}

export function BuyBox({ product: p, balance, cacaoValue }: Props) {
	const lots = useLots().data ?? []
	const out = p.stockLeft === 0
	const can = balance >= p.price && !out
	const missing = Math.max(0, p.price - balance)
	const steps = can ? plan(lots, p.price) : []

	return (
		<aside
			className={cn('buybox', !can && 'is-locked')}
			aria-label={`Canjear ${p.name}`}>
			<p className='buybox__price'>
				<Coin className='buybox__coin' />
				<b className='num'>{p.price}</b>
				<span>{p.price === 1 ? 'yema' : 'yemas'}</span>
			</p>
			<p className='buybox__worth'>
				Equivale a {formatMoney(p.price * cacaoValue)} en especie
			</p>
			<p className={cn('buybox__stock', out && 'is-out')}>
				<Icon name={out ? 'x' : 'check'} />
				{out
					? 'Agotado'
					: p.stockLeft == null
						? 'Disponible'
						: `Disponible · quedan ${p.stockLeft}`}
			</p>
			<dl className='buybox__math'>
				<div>
					<dt>Tienes</dt>
					<dd className='num'>{balance}</dd>
				</div>
				<div>
					<dt>Cuesta</dt>
					<dd className='num'>− {p.price}</dd>
				</div>
				<div className={cn('is-total', !can && 'is-short')}>
					<dt>{can ? 'Te quedan' : 'Te faltan'}</dt>
					<dd className='num'>{can ? balance - p.price : missing}</dd>
				</div>
			</dl>
			{can ? (
				<Link
					className='btn btn--grana btn--lg btn--block'
					to={ROUTES.trade(p.id)}>
					Canjear
				</Link>
			) : (
				<>
					<button className='btn btn--lg btn--block' type='button' disabled>
						{out ? 'Agotado' : `Te faltan ${cacaos(missing)}`}
					</button>
					{!out && (
						<Link className='buybox__help' to={ROUTES.earn}>
							Cómo ganar más yemas
							<Icon name='arrowRight' />
						</Link>
					)}
				</>
			)}
			{can && (
				<>
					<p className='buybox__trust'>
						<Icon name='ticket' />
						Recibes tu cupón al instante, vale {p.couponDays} días.
					</p>
					{steps.length > 0 && (
						<details className='buybox__lots'>
							<summary>Qué yemas se usan</summary>
							<p className='muted small'>Primero las que vencen antes.</p>
							<ol className='pay__list' role='list'>
								{steps.map(({ lot, take }) => (
									<li key={lot.id}>
										<span className='pay__n num'>
											<Coin />
											{take}
										</span>
										<span className='pay__src'>{lot.sourceRef}</span>
										<span className='pay__exp'>
											vence {shortDate(lot.expiresOn)}
										</span>
									</li>
								))}
							</ol>
						</details>
					)}
				</>
			)}
		</aside>
	)
}
