import { Link, NavLink } from 'react-router'

import { Coin, Wordmark } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'
import { useBalance } from '@/hooks/wallet/use_wallet'

import type { NavItem } from './nav_items'
import { UserMenu } from './user_menu'

export function TopBar({ items }: { items: NavItem[] }) {
	const { data } = useBalance()
	const balance = data?.balance ?? 0
	return (
		<header className='topbar'>
			<div className='topbar__inner'>
				<Link
					className='topbar__brand'
					to={ROUTES.market}
					aria-label='El Trueque, el mercado'>
					<Wordmark />
				</Link>
				<nav className='topnav' aria-label='Principal'>
					{items.map(i => (
						<NavLink key={i.to} className='topnav__link' to={i.to} end={i.end}>
							{i.label}
						</NavLink>
					))}
				</nav>
				<div className='topbar__actions'>
					<Link
						className='purse-chip'
						to={ROUTES.wallet}
						aria-label={`Tienes ${balance} cacaos`}>
						<Coin className='purse-chip__bean' />
						<b className='num'>{balance}</b>
						<span className='purse-chip__unit'>cacaos</span>
					</Link>
					<UserMenu />
				</div>
			</div>
		</header>
	)
}
