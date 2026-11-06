import * as THREE from 'three'

import type { Stage } from '@/utils/three/stage'

const asTexture = (canvas: HTMLCanvasElement) => {
	const texture = new THREE.CanvasTexture(canvas)
	texture.colorSpace = THREE.SRGBColorSpace
	return texture
}

export function plankTexture(cssVar: Stage['cssVar'], stripe: string) {
	const canvas = document.createElement('canvas')
	canvas.width = 256
	canvas.height = 128
	const g = canvas.getContext('2d')
	if (g) {
		g.fillStyle = cssVar('--color-estraza')
		g.fillRect(0, 0, 256, 128)
		g.fillStyle = cssVar('--color-amate-2')
		for (let x = 0; x < 256; x += 32) g.fillRect(x + 16, 0, 16, 128)
		g.strokeStyle = cssVar('--color-cacao-2')
		g.lineWidth = 3
		for (let x = 32; x < 256; x += 32) {
			g.beginPath()
			g.moveTo(x, 0)
			g.lineTo(x, 128)
			g.stroke()
		}
		g.fillStyle = cssVar(stripe)
		g.fillRect(0, 0, 256, 20)
		g.fillStyle = cssVar('--color-estraza')
		for (let x = 0; x < 256; x += 32) g.fillRect(x + 16, 0, 16, 20)
		g.fillStyle = cssVar('--color-cacao-2')
		g.fillRect(0, 116, 256, 12)
	}
	return asTexture(canvas)
}

export function priceSignTexture(
	cssVar: Stage['cssVar'],
	fill: string,
	text: string,
	price: number
) {
	const font = cssVar('--font-display')
	const canvas = document.createElement('canvas')
	canvas.width = 256
	canvas.height = 144
	const texture = asTexture(canvas)
	const draw = () => {
		const g = canvas.getContext('2d')
		if (!g) return
		g.fillStyle = cssVar(fill)
		g.fillRect(0, 0, 256, 144)
		g.lineWidth = 12
		g.strokeStyle = cssVar('--color-ink')
		g.strokeRect(6, 6, 244, 132)
		g.fillStyle = cssVar(text)
		g.font = `88px ${font}`
		g.textAlign = 'center'
		g.textBaseline = 'middle'
		g.fillText(String(price), 128, 80)
		texture.needsUpdate = true
	}
	draw()
	void document.fonts.load(`88px ${font}`).then(draw)
	return texture
}
