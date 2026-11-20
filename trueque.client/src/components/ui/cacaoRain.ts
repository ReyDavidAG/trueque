export function coinSprite(size: number, css: CSSStyleDeclaration) {
	const c = document.createElement('canvas')
	c.width = c.height = size
	const g = c.getContext('2d')
	if (!g) return c
	const v = (n: string) => css.getPropertyValue(n).trim()
	g.scale(size / 512, size / 512)
	g.fillStyle = v('--color-coin-rim')
	g.beginPath()
	g.arc(256, 256, 246, 0, Math.PI * 2)
	g.fill()
	g.fillStyle = v('--color-coin-face')
	g.beginPath()
	g.arc(256, 256, 224, 0, Math.PI * 2)
	g.fill()
	g.strokeStyle = v('--color-coin-ring')
	g.lineWidth = 8
	g.beginPath()
	g.arc(256, 256, 200, 0, Math.PI * 2)
	g.stroke()
	g.fillStyle = v('--color-maiz')
	g.beginPath()
	g.arc(256, 256, 132, 0, Math.PI * 2)
	g.fill()
	g.strokeStyle = v('--color-maiz-2')
	g.lineWidth = 16
	g.stroke()
	g.fillStyle = v('--color-coin-face')
	g.globalAlpha = 0.85
	g.beginPath()
	g.ellipse(212, 206, 42, 26, (-32 * Math.PI) / 180, 0, Math.PI * 2)
	g.fill()
	g.globalAlpha = 1
	return c
}
