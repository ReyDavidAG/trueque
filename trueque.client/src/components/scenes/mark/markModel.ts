import * as THREE from 'three'

import {
	MARK_BOARD,
	MARK_NAIL_Y,
	MARK_STRING_POINTS,
	MARK_UNIT,
} from '@/constants/scene/markScene'
import { POD_PATHS } from '@/utils/artDrawing'
import { roundedRectShape } from '@/utils/three/shapes'
import type { Stage } from '@/utils/three/stage'

const UP = new THREE.Vector3(0, 1, 0)

function drawBoardFace(cssVar: Stage['cssVar']) {
	const face = document.createElement('canvas')
	face.width = MARK_BOARD.w * 2
	face.height = MARK_BOARD.h * 2
	const g = face.getContext('2d')
	if (!g) return face
	g.scale(2, 2)
	g.translate(MARK_BOARD.w / 2, MARK_BOARD.h / 2)
	g.beginPath()
	g.roundRect(-212, -145, 424, 290, 46)
	g.fillStyle = cssVar('--color-grana')
	g.fill()
	g.lineWidth = 22
	g.strokeStyle = cssVar('--color-ink')
	g.stroke()
	g.rotate((-58 * Math.PI) / 180)
	g.scale(0.58, 0.58)
	g.translate(-256, -256)
	const body = new Path2D(POD_PATHS.body)
	g.fillStyle = cssVar('--color-maiz')
	g.fill(body)
	g.fillStyle = cssVar('--color-maiz-2')
	g.fill(new Path2D(POD_PATHS.rib))
	g.lineWidth = 18
	g.lineJoin = 'round'
	g.lineCap = 'round'
	g.stroke(body)
	g.stroke(new Path2D(POD_PATHS.stem))
	return face
}

function buildBoard(stage: Stage, ink: THREE.Material) {
	const { keep } = stage
	const map = keep(new THREE.CanvasTexture(drawBoardFace(stage.cssVar)))
	map.colorSpace = THREE.SRGBColorSpace
	map.anisotropy = 4
	const faceMaterial = keep(
		new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5 })
	)
	const plane = keep(
		new THREE.PlaneGeometry(MARK_BOARD.w * MARK_UNIT, MARK_BOARD.h * MARK_UNIT)
	)
	const slab = keep(
		new THREE.ExtrudeGeometry(
			roundedRectShape(
				MARK_BOARD.w * MARK_UNIT,
				MARK_BOARD.h * MARK_UNIT,
				MARK_BOARD.r * MARK_UNIT
			),
			{
				depth: MARK_BOARD.depth * MARK_UNIT,
				bevelEnabled: false,
				curveSegments: 8,
			}
		)
	)
	slab.center()

	const board = new THREE.Group()
	board.position.y = -MARK_BOARD.y * MARK_UNIT
	board.rotation.z = MARK_BOARD.tilt
	board.add(new THREE.Mesh(slab, ink))
	const front = new THREE.Mesh(plane, faceMaterial)
	front.position.z = (MARK_BOARD.depth / 2 + 0.5) * MARK_UNIT
	const back = new THREE.Mesh(plane, faceMaterial)
	back.position.z = -front.position.z
	back.rotation.y = Math.PI
	board.add(front, back)
	return board
}

function addString(stage: Stage, swing: THREE.Group, ink: THREE.Material) {
	const rod = stage.keep(
		new THREE.CylinderGeometry(10 * MARK_UNIT, 10 * MARK_UNIT, 1, 8)
	)
	const knot = stage.keep(new THREE.SphereGeometry(10 * MARK_UNIT, 10, 8))
	const points = MARK_STRING_POINTS.map(
		([x, y]) => new THREE.Vector3(x * MARK_UNIT, y * MARK_UNIT, 0)
	)
	for (let i = 0; i < points.length - 1; i++) {
		const a = points[i]
		const b = points[i + 1]
		const segment = new THREE.Mesh(rod, ink)
		segment.position.copy(a).add(b).multiplyScalar(0.5)
		segment.scale.y = a.distanceTo(b)
		segment.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize())
		swing.add(segment)
	}
	for (const p of points) {
		const k = new THREE.Mesh(knot, ink)
		k.position.copy(p)
		swing.add(k)
	}
}

export function buildMarkModel(stage: Stage, scene: THREE.Scene) {
	const ink = stage.keep(
		new THREE.MeshBasicMaterial({ color: stage.color('--color-ink') })
	)
	const nail = stage.keep(new THREE.SphereGeometry(26 * MARK_UNIT, 16, 12))

	const root = new THREE.Group()
	root.position.y = MARK_NAIL_Y
	scene.add(root)
	root.add(new THREE.Mesh(nail, ink))

	const swing = new THREE.Group()
	swing.rotation.order = 'ZYX'
	root.add(swing)
	swing.add(buildBoard(stage, ink))
	addString(stage, swing, ink)
	return swing
}
