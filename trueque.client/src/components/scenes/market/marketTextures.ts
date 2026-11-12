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
		g.fillStyle = cssVar('--color-carton')
		for (let x = 0; x < 256; x += 32) g.fillRect(x + 16, 20, 16, 108)
		g.strokeStyle = cssVar('--color-carton-sombra')
		g.lineWidth = 3
		for (let x = 32; x < 256; x += 32) {
			g.beginPath()
			g.moveTo(x, 20)
			g.lineTo(x, 128)
			g.stroke()
		}
		for (let x = 0; x < 256; x += 10)
			for (let y = 0; y < 20; y += 10) {
				const on = (x / 10 + y / 10) % 2 === 0
				g.fillStyle = on ? cssVar(stripe) : cssVar('--color-vichy-gris')
				g.fillRect(x, y, 10, 10)
			}
		g.fillStyle = cssVar('--color-anil')
		g.fillRect(0, 20, 256, 4)
	}
	return asTexture(canvas)
}

export function priceSignTexture(
	cssVar: Stage['cssVar'],
	fill: string,
	look: { kind: string; unit: string; price: number }
) {
	const font = cssVar('--font-display')
	const body = cssVar('--font-body')
	const canvas = document.createElement('canvas')
	canvas.width = 320
	canvas.height = 180
	const texture = asTexture(canvas)
	const draw = () => {
		const g = canvas.getContext('2d')
		if (!g) return
		g.fillStyle = cssVar('--color-estraza')
		g.fillRect(0, 0, 320, 180)
		for (let x = 0; x < 320; x += 12) {
			g.fillStyle = (x / 12) % 2 ? cssVar('--color-vichy-gris') : cssVar(fill)
			g.fillRect(x, 0, 12, 14)
		}
		g.fillStyle = cssVar(fill)
		g.fillRect(0, 150, 320, 30)
		g.textAlign = 'center'
		g.textBaseline = 'middle'
		g.fillStyle = cssVar(fill)
		g.font = `800 40px ${font}`
		g.fillText(look.kind.toUpperCase(), 160, 42, 300)
		const price = String(look.price)
		g.textAlign = 'left'
		g.fillStyle = cssVar('--color-ink')
		g.font = `800 78px ${font}`
		const priceWidth = g.measureText(price).width
		g.font = `700 26px ${body}`
		const unitWidth = g.measureText('cacaos').width
		const left = 160 - (priceWidth + 8 + unitWidth) / 2
		g.font = `800 78px ${font}`
		g.fillText(price, left, 102)
		g.font = `700 26px ${body}`
		g.fillText('cacaos', left + priceWidth + 8, 114)
		g.fillStyle = cssVar('--color-on-dark')
		g.textAlign = 'center'
		g.font = `700 22px ${body}`
		g.fillText(look.unit, 160, 166)
		texture.needsUpdate = true
	}
	draw()
	void document.fonts.load(`800 78px ${font}`).then(draw)
	return texture
}
