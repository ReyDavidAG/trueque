import type { MonthBar } from '@/components/wallet/movesChart'
import { WALLET_CHART_MONTHS } from '@/constants/wallet'
import type { Movement } from '@/types/walletType'

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
		if (move.amount > 0) bucket.earned += move.amount
		else bucket.spent += -move.amount
	}
	return months
}
