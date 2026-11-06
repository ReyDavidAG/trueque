import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { ROUTES } from '@/constants/routes'
import {
	ACT_MS,
	ANGRY_AFTER_POKES,
	ANNOYING_PARTS,
	CALM_MS,
	IDLE_CHECK_MS,
	IDLE_TALK_MS,
	KICK_OUT_MS,
	PART_ACTS,
	PRICE_TALK_PARTS,
	QUIP_MS,
	type VendorAct,
	type VendorPart,
	WARN_AFTER_POKES,
} from '@/constants/vendor'
import {
	ANGRY_FOLLOW_UPS,
	ANGRY_LINES,
	shortOfCacaosLines,
	VENDOR_LINES,
	WARNING_LINES,
} from '@/constants/vendorLines'

const randomLine = (lines: string[]) =>
	lines[Math.floor(Math.random() * lines.length)]

const pickLine = (lines: string[], part: VendorPart, turn: number) =>
	part === 'idle' ? randomLine(lines) : lines[turn % lines.length]

export function useVendorTalk(missing: number) {
	const navigate = useNavigate()
	const [quip, setQuip] = useState<string | null>(null)
	const [angry, setAngry] = useState(false)
	const [act, setAct] = useState<VendorAct | null>(null)
	const [here, setHere] = useState(false)
	const say = useRef<(part: VendorPart) => void>(() => undefined)
	const timers = useRef<number[]>([])
	const pokes = useRef({ count: 0, at: 0, turn: 0 })
	const arrivedAt = useRef<number | null>(null)
	const lastTalkAt = useRef(0)

	const later = useCallback((run: () => void, ms: number) => {
		timers.current.push(window.setTimeout(run, ms))
	}, [])

	useEffect(() => {
		say.current = part => {
			if (angry || (!here && part !== 'arrive')) return
			const poke = pokes.current
			const now = Date.now()
			const annoying = ANNOYING_PARTS.includes(part)
			lastTalkAt.current = now
			poke.turn += 1
			const move = PART_ACTS[part]
			if (move) {
				setAct(move)
				later(() => setAct(a => (a === move ? null : a)), ACT_MS)
			}
			if (annoying) {
				poke.count = now - poke.at > CALM_MS ? 1 : poke.count + 1
				poke.at = now
			}
			if (poke.count >= ANGRY_AFTER_POKES) {
				setAngry(true)
				setQuip(randomLine(ANGRY_LINES))
				later(() => setQuip(randomLine(ANGRY_FOLLOW_UPS)), KICK_OUT_MS / 2)
				later(() => navigate(ROUTES.market), KICK_OUT_MS)
				return
			}
			const lines =
				poke.count >= WARN_AFTER_POKES && annoying
					? WARNING_LINES
					: missing > 0 && PRICE_TALK_PARTS.includes(part)
						? shortOfCacaosLines(missing)
						: VENDOR_LINES[part]
			const line = pickLine(lines, part, poke.turn)
			setQuip(line)
			later(() => setQuip(q => (q === line ? null : q)), QUIP_MS)
		}
	}, [angry, here, navigate, missing, later])

	useEffect(() => {
		const pending = timers.current
		return () => pending.forEach(clearTimeout)
	}, [])

	useEffect(() => {
		if (!here || angry) return
		const id = window.setInterval(() => {
			if (Date.now() - lastTalkAt.current > IDLE_TALK_MS) say.current('idle')
		}, IDLE_CHECK_MS)
		return () => clearInterval(id)
	}, [here, angry])

	const ring = () => {
		if (here) return say.current('bell')
		arrivedAt.current = performance.now()
		pokes.current.count = 0
		setHere(true)
		say.current('arrive')
	}

	return { say, later, quip, angry, act, here, ring, arrivedAt }
}
