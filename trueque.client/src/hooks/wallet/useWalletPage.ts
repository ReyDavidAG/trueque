import { useMemo } from 'react'

import { useBalance, useMovements } from '@/hooks/wallet/useWallet'
import type { Movement } from '@/types/walletType'
import { isEarned, isTraded } from '@/utils/movementKind'

const sumAmounts = (moves: Movement[]) =>
	moves.reduce((sum, m) => sum + Math.abs(m.amount), 0)

export function useWalletPage() {
	const balance = useBalance()
	const moves = useMovements()
	const list = useMemo(() => moves.data ?? [], [moves.data])
	const totals = useMemo(
		() => ({
			earned: sumAmounts(list.filter(isEarned)),
			spent: sumAmounts(list.filter(isTraded)),
		}),
		[list]
	)

	return {
		list,
		totals,
		balance: balance.data?.balance ?? 0,
		expiringSoon: balance.data?.expiring60d ?? 0,
		movesError: moves.error,
		movesLoading: moves.isLoading,
		retryMoves: () => void moves.refetch(),
	}
}
