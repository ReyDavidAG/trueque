import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { CountUp } from '@/components/ui/count_up'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { Balance } from '@/types/wallet_type'
import { cacaos } from '@/utils/cacaos'

export function Purse({ balance }: { balance: Balance }) {
	return (
		<section className='purse' aria-labelledby='purse-title'>
			<div className='purse__coins' aria-hidden='true'>
				<Coin className='purse__coin is-back' />
				<Coin className='purse__coin' />
			</div>
			<div className='purse__text'>
				<p className='kicker' id='purse-title'>
					Tus cacaos
				</p>
				<p className='purse__n'>
					<span className='num'>
						<CountUp to={balance.balance} />
					</span>{' '}
					<span>{balance.balance === 1 ? 'cacao' : 'cacaos'}</span>
				</p>
				{balance.expiring60d ? (
					<p className='purse__warn'>
						<Icon name='clock' />
						{cacaos(balance.expiring60d)} vencen en los próximos dos meses. Se
						gastan primero los más viejos.
					</p>
				) : (
					<p className='purse__ok'>Ninguno vence en los próximos dos meses.</p>
				)}
			</div>
			<Link className='btn btn--ghost btn--sm purse__more' to={ROUTES.earn}>
				Cómo gano más
			</Link>
		</section>
	)
}
