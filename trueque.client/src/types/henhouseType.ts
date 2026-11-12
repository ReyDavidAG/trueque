import type { Movement } from '@/types/walletType'

export type HenFlock = { source: string; total: number; moves: Movement[] }

export type EggInfo = {
	move: Movement
	part: number
	index: number
	count: number
}

export type HenhouseTip = EggInfo & { x: number; y: number }
