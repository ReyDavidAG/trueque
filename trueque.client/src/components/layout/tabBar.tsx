import { NavLink } from 'react-router'

import { Icon } from '@/components/ui/icon'

import type { NavItem } from './navItems'

export function TabBar({ items }: { items: NavItem[] }) {
	return (
		<nav className='tabbar' aria-label='Principal'>
			{items.map(i => (
				<NavLink key={i.to} className='tabbar__item' to={i.to} end={i.end}>
					<Icon name={i.icon} />
					<span>{i.label}</span>
				</NavLink>
			))}
		</nav>
	)
}
