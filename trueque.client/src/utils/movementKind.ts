import type { Movement } from '@/types/walletType'

export const isEarned = (move: Pick<Movement, 'amount'>) => move.amount > 0

export const isTraded = (move: Pick<Movement, 'kind'>) => move.kind === 'spend'
