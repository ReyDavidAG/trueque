import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { CountUp } from '@/components/ui/countUp'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useConfig } from '@/hooks/config/useConfig'
import { useBalance, useLots } from '@/hooks/wallet/useWallet'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { daysUntil, shortDate } from '@/utils/dates'

const SOON_DAYS = 60

export function PurseCard() {
	const balance = useBalance().data?.balance ?? 0
	const value = useConfig().data?.cacaoValue ?? 5
	const lots = useLots().data ?? []
	const soon = lots.filter(
		l => l.remaining > 0 && daysUntil(l.expiresOn) <= SOON_DAYS
	)
	const soonTotal = soon.reduce((sum, l) => sum + l.remaining, 0)

	return (
		<div className='purse hub__purse is-compact'>
			<div className='purse__coins' aria-hidden='true'>
				<Coin className='purse__coin is-back' />
				<Coin className='purse__coin' />
			</div>
			<div className='purse__text'>
				<p className='kicker'>Tus yemas</p>
				<p className='purse__n'>
					<span className='num'>
						<CountUp to={balance} />
					</span>{' '}
					<span>{balance === 1 ? 'yema' : 'yemas'}</span>
				</p>
				<p className='purse__worth'>
					≈ {formatMoney(balance * value)} para canjear
				</p>
			</div>
			{soonTotal ? (
				<p className='purse__warn'>
					<Icon name='clock' />
					<span>
						{cacaos(soonTotal)} vencen el {shortDate(soon[0].expiresOn)}
					</span>
				</p>
			) : (
				<p className='purse__ok'>
					<Icon name='check' />
					<span>Ninguna vence pronto</span>
				</p>
			)}
			<Link className='purse__more' to={ROUTES.wallet}>
				<span className='purse__more-ver'>Ver </span>
				<span className='purse__more-txt'>movimientos</span>
				<Icon name='arrowRight' />
			</Link>
		</div>
	)
}
