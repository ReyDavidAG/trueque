import type { IconName } from '@/components/ui/icon'
import type { Movement } from '@/types/walletType'

export const MOVE_ICON: Record<Movement['kind'], IconName> = {
	earn: 'spark',
	spend: 'ticket',
	expire: 'clock',
	refund: 'arrowLeft',
	adjust: 'edit',
}
