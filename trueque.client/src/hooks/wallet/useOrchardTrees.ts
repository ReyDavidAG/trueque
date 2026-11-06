import { useMemo } from 'react'

import { ORCHARD } from '@/constants/orchard'
import type { OrchardTree } from '@/types/orchardType'
import type { Movement } from '@/types/walletType'
import { movementSource } from '@/utils/movementLabel'

function groupBySource(moves: Movement[]) {
	const bySource = new Map<string, OrchardTree>()
	for (const move of moves) {
		if (move.amount <= 0) continue
		const source = movementSource(move)
		const tree = bySource.get(source) ?? { source, total: 0, moves: [] }
		tree.total += move.amount
		tree.moves.push(move)
		bySource.set(source, tree)
	}
	return [...bySource.values()].sort((a, b) => b.total - a.total)
}

function capTrees(sorted: OrchardTree[]) {
	if (sorted.length <= ORCHARD.maxTrees) return sorted
	const rest = sorted.slice(ORCHARD.maxTrees - 1)
	return [
		...sorted.slice(0, ORCHARD.maxTrees - 1),
		{
			source: ORCHARD.otherSourcesLabel,
			total: rest.reduce((sum, tree) => sum + tree.total, 0),
			moves: rest.flatMap(tree => tree.moves),
		},
	]
}

export function useOrchardTrees(moves: Movement[]) {
	return useMemo(() => capTrees(groupBySource(moves)), [moves])
}
