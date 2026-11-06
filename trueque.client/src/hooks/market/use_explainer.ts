import { useRef, useState } from 'react'

import { prefersReducedMotion } from '@/utils/reduced_motion'

const CLOSE_MS = 240
const OPEN_DELAY_MS = 20

export function useExplainer(slideCount: number) {
	const [open, setOpen] = useState(false)
	const [visible, setVisible] = useState(false)
	const [step, setStep] = useState(0)
	const [direction, setDirection] = useState(1)
	const [paused, setPaused] = useState(false)
	const timer = useRef<number>(0)
	const last = slideCount - 1

	const go = (next: number) => {
		setDirection(next >= step ? 1 : -1)
		setStep(Math.max(0, Math.min(last, next)))
	}

	const toggle = () => {
		window.clearTimeout(timer.current)
		if (visible) {
			setVisible(false)
			timer.current = window.setTimeout(
				() => setOpen(false),
				prefersReducedMotion() ? 0 : CLOSE_MS
			)
			return
		}
		setStep(0)
		setDirection(1)
		setPaused(false)
		setOpen(true)
		timer.current = window.setTimeout(() => setVisible(true), OPEN_DELAY_MS)
	}

	return {
		open,
		visible,
		step,
		direction,
		paused,
		last,
		stopped: paused || !visible,
		go,
		toggle,
		togglePause: () => setPaused(p => !p),
		advance: () => step < last && go(step + 1),
	}
}

export type ExplainerState = ReturnType<typeof useExplainer>
