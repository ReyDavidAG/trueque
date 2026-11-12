import { useMemo } from 'react'

import { HENHOUSE } from '@/constants/henhouse'
import type { HenFlock } from '@/types/henhouseType'
import type { Movement } from '@/types/walletType'
import { movementSource } from '@/utils/movementLabel'

function groupBySource(moves: Movement[]) {
	const bySource = new Map<string, HenFlock>()
	for (const move of moves) {
		if (move.amount <= 0) continue
		const source = movementSource(move)
		const flock = bySource.get(source) ?? { source, total: 0, moves: [] }
		flock.total += move.amount
		flock.moves.push(move)
		bySource.set(source, flock)
	}
	return [...bySource.values()].sort((a, b) => b.total - a.total)
}

function capFlocks(sorted: HenFlock[]) {
	if (sorted.length <= HENHOUSE.maxHens) return sorted
	const rest = sorted.slice(HENHOUSE.maxHens - 1)
	return [
		...sorted.slice(0, HENHOUSE.maxHens - 1),
		{
			source: HENHOUSE.otherSourcesLabel,
			total: rest.reduce((sum, flock) => sum + flock.total, 0),
			moves: rest.flatMap(flock => flock.moves),
		},
	]
}

export function useHenFlocks(moves: Movement[]) {
	return useMemo(() => capFlocks(groupBySource(moves)), [moves])
}
