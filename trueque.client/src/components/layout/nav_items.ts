import type { IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/types/session_type'

export interface NavItem {
	to: string
	label: string
	icon: IconName
	end?: boolean
}

export function navItems(role: Role): NavItem[] {
	const items: NavItem[] = [
		{ to: ROUTES.market, label: 'El mercado', icon: 'store', end: true },
		{ to: ROUTES.coupons, label: 'Mis cupones', icon: 'ticket' },
		{ to: ROUTES.earn, label: 'Cómo gano', icon: 'spark' },
	]
	if (role === 'company')
		items.push({ to: ROUTES.panel, label: 'Mi puesto', icon: 'building' })
	if (role === 'hr')
		items.push({ to: ROUTES.panel, label: 'Aprobar', icon: 'scale' })
	return items
}
