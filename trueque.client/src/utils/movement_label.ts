import type { Movement } from '@/types/wallet_type'

const SEPARATOR = ' · '

export const movementSource = (move: Movement) => move.label.split(SEPARATOR)[0]

export const movementReference = (move: Movement) =>
	move.label.split(SEPARATOR).slice(1).join(SEPARATOR)
