import { Link, NavLink } from 'react-router'

import { Coin, Wordmark } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'
import { useBalance } from '@/hooks/wallet/useWallet'

import type { NavItem } from './navItems'
import { NotificationsBell } from './notificationsBell'
import { SquishEgg } from './squishEgg'
import { ThemeMenu } from './themeMenu'
import { UserMenu } from './userMenu'

export function TopBar({ items }: { items: NavItem[] }) {
	const { data } = useBalance()
	const balance = data?.balance ?? 0
	return (
		<header className='topbar'>
			<div className='topbar__inner'>
				<div className='topbar__brand'>
					<SquishEgg />
					<Link to={ROUTES.market} aria-label='La Despensa, la despensa'>
						<Wordmark mark={null} />
					</Link>
				</div>
				<span className='version-tag num' title='Versión de la demostración'>
					v{import.meta.env.VITE_APP_VERSION}
				</span>
				<nav className='topnav' aria-label='Principal'>
					{items.map(i => (
						<NavLink key={i.to} className='topnav__link' to={i.to} end={i.end}>
							{i.label}
						</NavLink>
					))}
				</nav>
				<div className='topbar__actions'>
					<ThemeMenu />
					<NotificationsBell />
					<Link
						className='purse-chip'
						to={ROUTES.wallet}
						aria-label={`Tienes ${balance} yemas`}>
						<Coin className='purse-chip__bean' />
						<b className='num'>{balance}</b>
						<span className='purse-chip__unit'>yemas</span>
					</Link>
					<UserMenu />
				</div>
			</div>
		</header>
	)
}
