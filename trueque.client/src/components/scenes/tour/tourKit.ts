import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacaoRain'
import { TOUR_TICKET } from '@/constants/scene/tourScene'
import { notchedTicketShape } from '@/utils/three/shapes'
import type { Stage } from '@/utils/three/stage'

function drawTicketFace(stage: Stage) {
	const { cssVar, css } = stage
	const face = document.createElement('canvas')
	face.width = 340
	face.height = 190
	const g = face.getContext('2d')
	if (!g) return face
	g.fillStyle = cssVar('--color-estraza')
	g.fillRect(0, 0, 340, 190)
	g.fillStyle = cssVar('--color-grana')
	g.fillRect(0, 0, 92, 190)
	g.setLineDash([10, 9])
	g.lineWidth = 5
	g.strokeStyle = cssVar('--color-ink')
	g.beginPath()
	g.moveTo(92, 14)
	g.lineTo(92, 176)
	g.stroke()
	g.setLineDash([])
	g.fillStyle = cssVar('--color-ink')
	g.font = `700 34px ${cssVar('--font-mono')}`
	g.fillText('CAC-', 120, 82)
	g.fillRect(120, 108, 180, 12)
	g.fillRect(120, 132, 120, 12)
	g.drawImage(coinSprite(64, css), 14, 63, 64, 64)
	return face
}

export function createTourKit(stage: Stage) {
	const { keep, color, css } = stage
	const toon = (name: string) =>
		keep(new THREE.MeshToonMaterial({ color: color(name) }))
	const hull = keep(
		new THREE.MeshBasicMaterial({
			color: color('--color-ink'),
			side: THREE.BackSide,
		})
	)
	const glass = keep(
		new THREE.MeshToonMaterial({
			color: color('--color-on-dark'),
			transparent: true,
			opacity: 0.35,
		})
	)

	const outlined = (
		geometry: THREE.BufferGeometry,
		material: THREE.Material | THREE.Material[],
		outlineScale = 1.06
	) => {
		keep(geometry)
		const object = new THREE.Mesh(geometry, material)
		if (outlineScale) {
			const outline = new THREE.Mesh(geometry, hull)
			outline.scale.setScalar(outlineScale)
			object.add(outline)
		}
		return object
	}

	const coinTexture = keep(new THREE.CanvasTexture(coinSprite(256, css)))
	coinTexture.colorSpace = THREE.SRGBColorSpace
	const coinFace = keep(
		new THREE.MeshToonMaterial({ map: coinTexture, transparent: true })
	)
	const coinRim = toon('--color-cacao-3')
	const coin = (radius: number) => {
		const geometry = new THREE.CylinderGeometry(
			radius,
			radius,
			radius * 0.22,
			40
		)
		geometry.rotateX(Math.PI / 2)
		return outlined(geometry, [coinRim, coinFace, coinFace], 1.05)
	}

	const ticketTexture = keep(new THREE.CanvasTexture(drawTicketFace(stage)))
	ticketTexture.colorSpace = THREE.SRGBColorSpace
	ticketTexture.repeat.set(1 / TOUR_TICKET.w, 1 / TOUR_TICKET.h)
	ticketTexture.offset.set(0.5, 0.5)
	const ticketFace = keep(new THREE.MeshToonMaterial({ map: ticketTexture }))
	const ticket = (scale = 1) => {
		const geometry = new THREE.ExtrudeGeometry(
			notchedTicketShape(TOUR_TICKET.w, TOUR_TICKET.h, TOUR_TICKET.notch),
			{ depth: 0.08, bevelEnabled: false, curveSegments: 10 }
		)
		geometry.center()
		const object = outlined(
			geometry,
			[ticketFace, toon('--color-amate-3')],
			1.04
		)
		object.scale.setScalar(scale)
		return object
	}

	return { keep, color, toon, glass, outlined, coin, ticket }
}

export type TourKit = ReturnType<typeof createTourKit>

export type TourModel = { group: THREE.Group; update: (t: number) => void }
