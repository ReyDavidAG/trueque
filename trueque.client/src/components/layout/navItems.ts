import type { IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/types/sessionType'

export interface NavItem {
	to: string
	label: string
	icon: IconName
	end?: boolean
}

const ITEMS = {
	market: { to: ROUTES.market, label: 'La despensa', icon: 'store', end: true },
	coupons: { to: ROUTES.coupons, label: 'Mis cupones', icon: 'ticket' },
	earn: { to: ROUTES.earn, label: 'Cómo gano', icon: 'spark' },
	panel: { to: ROUTES.panel, label: 'Mi anaquel', icon: 'building' },
	redeem: { to: ROUTES.redeem, label: 'Canjear', icon: 'scan' },
	review: { to: ROUTES.panel, label: 'Aprobar', icon: 'scale' },
	gifts: { to: ROUTES.gifts, label: 'Regalos', icon: 'gift' },
	dashboard: { to: ROUTES.dashboard, label: 'Tablero', icon: 'chart' },
	settings: { to: ROUTES.settings, label: 'Ajustes', icon: 'settings' },
} satisfies Record<string, NavItem>

type ItemKey = keyof typeof ITEMS

const BY_ROLE: Record<Role, ItemKey[]> = {
	member: ['market', 'coupons', 'earn'],
	company: ['market', 'panel', 'redeem', 'coupons'],
	hr: ['market', 'review', 'gifts', 'dashboard', 'settings'],
}

export const navItems = (role: Role, canApproveGrants = false): NavItem[] => {
	const keys = BY_ROLE[role]
	const withGifts: ItemKey[] =
		canApproveGrants && !keys.includes('gifts') ? [...keys, 'gifts'] : keys
	return withGifts.map(k => ITEMS[k])
}
