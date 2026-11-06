import type { IconName } from '@/components/ui/icon'
import type { Movement } from '@/types/wallet_type'

export const WALLET_CHART_MONTHS = 6

export const MOVE_FILTERS = [
	['all', 'Todos'],
	['earn', 'Ganados'],
	['spend', 'Cambiados'],
] as const

export type MoveFilter = (typeof MOVE_FILTERS)[number][0]

export const MOVE_ICON: Record<Movement['kind'], IconName> = {
	earn: 'spark',
	spend: 'ticket',
	expire: 'clock',
	refund: 'arrowLeft',
	adjust: 'edit',
}
