import { type PointerEvent, useRef } from 'react'

import { ART_HEIGHT, ART_WIDTH } from '@/constants/lookEditor'

interface Position {
	x: number
	y: number
}

interface DragStart {
	pointerX: number
	pointerY: number
	layerX: number
	layerY: number
	width: number
}

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))

export function useLayerDrag(
	origin: Position,
	enabled: boolean,
	onMove: (to: Position) => void
) {
	const drag = useRef<DragStart | null>(null)

	const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
		if (!enabled) return
		const rect = e.currentTarget.getBoundingClientRect()
		drag.current = {
			pointerX: e.clientX,
			pointerY: e.clientY,
			layerX: origin.x,
			layerY: origin.y,
			width: rect.width,
		}
		e.currentTarget.setPointerCapture(e.pointerId)
	}

	const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
		const start = drag.current
		if (!start) return
		const scale = ART_WIDTH / start.width
		onMove({
			x: clamp(start.layerX + (e.clientX - start.pointerX) * scale, ART_WIDTH),
			y: clamp(start.layerY + (e.clientY - start.pointerY) * scale, ART_HEIGHT),
		})
	}

	const release = () => {
		drag.current = null
	}

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: release,
		onPointerCancel: release,
	}
}

export type LayerDragHandlers = ReturnType<typeof useLayerDrag>
