import { useEffect, useRef, useState } from 'react'

const RESPAWN_MS = 2600

export type EggSpot = { id: string; x: number; y: number; tone: string }

export type Burst = { id: number; x: number; y: number; coins: number[] }

export function useEggCracks() {
	const [broken, setBroken] = useState<Set<string>>(() => new Set())
	const [bursts, setBursts] = useState<Burst[]>([])
	const timers = useRef<number[]>([])
	const next = useRef(0)

	useEffect(() => {
		const pending = timers.current
		return () => pending.forEach(t => window.clearTimeout(t))
	}, [])

	const crack = (egg: EggSpot) => {
		if (broken.has(egg.id)) return
		const id = next.current++
		const coins = [Math.random() < 0.5 ? -18 : 18]
		setBroken(prev => new Set(prev).add(egg.id))
		setBursts(prev => [...prev, { id, x: egg.x, y: egg.y, coins }])
		timers.current.push(
			window.setTimeout(() => {
				setBroken(prev => {
					const rest = new Set(prev)
					rest.delete(egg.id)
					return rest
				})
				setBursts(prev => prev.filter(b => b.id !== id))
			}, RESPAWN_MS)
		)
	}

	return { broken, bursts, crack }
}
