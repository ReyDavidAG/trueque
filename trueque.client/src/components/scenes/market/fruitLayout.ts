import {
	COUNTER_AREA,
	COUNTER_ODDS,
	COUNTER_TOP,
	FRUIT_RADIUS,
	type FruitKind,
	GROUND_ODDS,
	MARKET_BOUNDS,
	stallCenterX,
} from '@/constants/scene/marketScene'

import { makeFruit } from './fruitBuilder'
import type { MarketKit } from './marketKit'
import { pickOne } from './marketMath'
import type { Fruit } from './marketTypes'

type Spot = { x: number; z: number; r: number }
type Range = [number, number]
type Scatter = {
	odds: FruitKind[]
	xRange: Range
	zRange: Range
	floor: number
	count: number
	avoidStalls: boolean
}

const MAX_TRIES = 400

export function scatterFruits(kit: MarketKit, stallCount: number) {
	const fruits: Fruit[] = []

	const blocksStall = (x: number, z: number, r: number) =>
		Array.from({ length: stallCount }).some(
			(_, i) =>
				Math.abs(x - stallCenterX(i)) < 1.02 + r && Math.abs(z) < 0.42 + r
		)

	const scatter = ({
		odds,
		xRange: [x0, x1],
		zRange: [z0, z1],
		floor,
		count,
		avoidStalls,
	}: Scatter) => {
		const taken: Spot[] = []
		for (
			let placed = 0, tries = 0;
			placed < count && tries < MAX_TRIES;
			tries++
		) {
			const kind = pickOne(odds)
			const r = FRUIT_RADIUS[kind]
			const x = x0 + r + Math.random() * (x1 - x0 - 2 * r)
			const z = z0 + r + Math.random() * (z1 - z0 - 2 * r)
			if (avoidStalls && blocksStall(x, z, r)) continue
			if (taken.some(t => Math.hypot(t.x - x, t.z - z) < t.r + r + 0.006))
				continue
			taken.push({ x, z, r })
			fruits.push(makeFruit(kit, kind, x, z, floor))
			placed++
		}
	}

	for (let i = 0; i < stallCount; i++) {
		const x = stallCenterX(i)
		scatter({
			odds: COUNTER_ODDS,
			xRange: [x - COUNTER_AREA.x, x + COUNTER_AREA.x],
			zRange: [-COUNTER_AREA.z, COUNTER_AREA.z],
			floor: COUNTER_TOP,
			count: 9 + Math.floor(Math.random() * 5),
			avoidStalls: false,
		})
	}
	scatter({
		odds: GROUND_ODDS,
		xRange: [-MARKET_BOUNDS.x + 0.1, MARKET_BOUNDS.x - 0.1],
		zRange: [MARKET_BOUNDS.zMin + 0.1, MARKET_BOUNDS.zMax - 0.1],
		floor: 0,
		count: 16 + Math.floor(Math.random() * 8),
		avoidStalls: true,
	})
	return fruits
}
