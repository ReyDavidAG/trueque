import * as THREE from 'three'

export function tokenColors(css: CSSStyleDeclaration) {
	const ctx = document
		.createElement('canvas')
		.getContext('2d', { willReadFrequently: true })
	return (name: string) => {
		const color = new THREE.Color()
		if (!ctx) return color
		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = css.getPropertyValue(name).trim()
		ctx.fillRect(0, 0, 1, 1)
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
		return color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
	}
}
