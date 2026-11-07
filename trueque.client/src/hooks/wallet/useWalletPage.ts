import { useMemo, useState } from 'react'

import type { MoveFilter } from '@/constants/wallet'
import { useBalance, useMovements } from '@/hooks/wallet/useWallet'
import type { Movement } from '@/types/walletType'
import { isEarned, isTraded } from '@/utils/movementKind'
import { buildMonthBars } from '@/utils/walletMonths'

const FILTER_TEST: Record<MoveFilter, (move: Movement) => boolean> = {
	all: () => true,
	earn: isEarned,
	spend: isTraded,
}

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
	const months = useMemo(() => buildMonthBars(list), [list])
	const [filter, setFilter] = useState<MoveFilter>('all')
	const shown = list.filter(FILTER_TEST[filter])

	return {
		list,
		shown,
		totals,
		months,
		filter,
		setFilter,
		balance: balance.data?.balance ?? 0,
		expiringSoon: balance.data?.expiring60d ?? 0,
		movesError: moves.error,
		movesLoading: moves.isLoading,
		retryMoves: () => void moves.refetch(),
	}
}
