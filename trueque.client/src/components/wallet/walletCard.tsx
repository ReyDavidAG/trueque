import { Coin } from '@/components/ui/art'
import { CountUp } from '@/components/ui/countUp'
import { cn } from '@/utils/cn'

interface Props {
	balance: number
	earned: number
	spent: number
	expiringSoon: number
}

export function WalletCard({ balance, earned, spent, expiringSoon }: Props) {
	return (
		<section className='wallet' aria-label='Tu saldo'>
			<div className='wallet__coins' aria-hidden='true'>
				<Coin className='wallet__coin is-back' />
				<Coin className='wallet__coin' />
			</div>
			<p className='wallet__n'>
				<span className='num'>
					<CountUp to={balance} />
				</span>
				<span>{balance === 1 ? 'yema' : 'yemas'}</span>
			</p>
			<dl className='wallet__stats'>
				<div>
					<dt>Ganadas</dt>
					<dd className='num'>{earned}</dd>
				</div>
				<div>
					<dt>Cambiadas</dt>
					<dd className='num'>{spent}</dd>
				</div>
				<div className={cn(expiringSoon > 0 && 'is-soon')}>
					<dt>Vencen pronto</dt>
					<dd className='num'>{expiringSoon}</dd>
				</div>
			</dl>
		</section>
	)
}
