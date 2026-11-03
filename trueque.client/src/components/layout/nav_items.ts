import type { IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/types/session_type'

export interface NavItem {
	to: string
	label: string
	icon: IconName
	end?: boolean
}

const ITEMS = {
	market: { to: ROUTES.market, label: 'El mercado', icon: 'store', end: true },
	coupons: { to: ROUTES.coupons, label: 'Mis cupones', icon: 'ticket' },
	earn: { to: ROUTES.earn, label: 'Cómo gano', icon: 'spark' },
	panel: { to: ROUTES.panel, label: 'Mi puesto', icon: 'building' },
	redeem: { to: ROUTES.redeem, label: 'Canjear', icon: 'scan' },
	review: { to: ROUTES.panel, label: 'Aprobar', icon: 'scale' },
	dashboard: { to: ROUTES.dashboard, label: 'Tablero', icon: 'chart' },
	settings: { to: ROUTES.settings, label: 'Ajustes', icon: 'settings' },
} satisfies Record<string, NavItem>

const BY_ROLE: Record<Role, (keyof typeof ITEMS)[]> = {
	member: ['market', 'coupons', 'earn'],
	company: ['market', 'panel', 'redeem', 'coupons'],
	hr: ['market', 'review', 'dashboard', 'settings'],
}

export const navItems = (role: Role): NavItem[] =>
	BY_ROLE[role].map(k => ITEMS[k])
