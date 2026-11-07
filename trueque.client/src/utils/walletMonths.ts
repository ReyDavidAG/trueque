import { WALLET_CHART_MONTHS } from '@/constants/wallet'
import type { MonthBar, Movement } from '@/types/walletType'
import { isEarned, isTraded } from '@/utils/movementKind'

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`

const monthLabel = (date: Date) =>
	date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')

export function buildMonthBars(moves: Movement[]): MonthBar[] {
	const latest = moves.reduce(
		(max, move) => Math.max(max, new Date(move.createdAt).getTime()),
		Date.now()
	)
	const end = new Date(latest)
	const months = Array.from({ length: WALLET_CHART_MONTHS }, (_, i) => {
		const date = new Date(
			end.getFullYear(),
			end.getMonth() - (WALLET_CHART_MONTHS - 1 - i),
			1
		)
		return { key: monthKey(date), label: monthLabel(date), earned: 0, spent: 0 }
	})
	const byKey = new Map(months.map(month => [month.key, month]))
	for (const move of moves) {
		const bucket = byKey.get(monthKey(new Date(move.createdAt)))
		if (!bucket) continue
		if (isEarned(move)) bucket.earned += move.amount
		else if (isTraded(move)) bucket.spent += Math.abs(move.amount)
	}
	return months
}
