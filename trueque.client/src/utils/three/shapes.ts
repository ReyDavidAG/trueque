import * as THREE from 'three'

export function roundedRectShape(w: number, h: number, r: number) {
	const x = -w / 2
	const y = -h / 2
	const s = new THREE.Shape()
	s.moveTo(x + r, y)
	s.lineTo(x + w - r, y)
	s.quadraticCurveTo(x + w, y, x + w, y + r)
	s.lineTo(x + w, y + h - r)
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
	s.lineTo(x + r, y + h)
	s.quadraticCurveTo(x, y + h, x, y + h - r)
	s.lineTo(x, y + r)
	s.quadraticCurveTo(x, y, x + r, y)
	return s
}

export function starShape(outer: number, inner: number) {
	const s = new THREE.Shape()
	for (let i = 0; i < 8; i++) {
		const radius = i % 2 ? inner : outer
		const angle = (i / 8) * Math.PI * 2 + Math.PI / 2
		if (i) s.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
		else s.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
	}
	s.closePath()
	return s
}

export function notchedTicketShape(w: number, h: number, notch: number) {
	const x = -w / 2
	const y = -h / 2
	const r = 0.1
	const s = new THREE.Shape()
	s.moveTo(x + r, y)
	s.lineTo(x + w - r, y)
	s.quadraticCurveTo(x + w, y, x + w, y + r)
	s.lineTo(x + w, -notch)
	s.absarc(x + w, 0, notch, -Math.PI / 2, Math.PI / 2, true)
	s.lineTo(x + w, y + h - r)
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
	s.lineTo(x + r, y + h)
	s.quadraticCurveTo(x, y + h, x, y + h - r)
	s.lineTo(x, notch)
	s.absarc(x, 0, notch, Math.PI / 2, -Math.PI / 2, true)
	s.lineTo(x, y + r)
	s.quadraticCurveTo(x, y, x + r, y)
	return s
}
