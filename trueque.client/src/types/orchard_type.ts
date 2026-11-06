import type { Movement } from '@/types/wallet_type'

export type OrchardTree = { source: string; total: number; moves: Movement[] }

export type PodInfo = { move: Movement; part: number; index: number; count: number }

export type OrchardTip = PodInfo & { x: number; y: number }
