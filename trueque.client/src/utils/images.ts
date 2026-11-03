export const MAX_IMAGES = 2
export const MAX_BYTES = 300 * 1024
const MAX_SIDE = 1200
const TYPES = ['image/png', 'image/jpeg', 'image/webp']

export const bytesOf = (dataUrl: string) =>
	Math.round(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4)

function load(file: File) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const url = URL.createObjectURL(file)
		const img = new Image()
		img.onload = () => {
			URL.revokeObjectURL(url)
			resolve(img)
		}
		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('No pudimos leer esa imagen.'))
		}
		img.src = url
	})
}

export async function compressImage(file: File) {
	if (!TYPES.includes(file.type)) throw new Error('Sólo fotos PNG, JPG o WebP.')
	const img = await load(file)
	const scale = Math.min(
		1,
		MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight)
	)
	const canvas = document.createElement('canvas')
	canvas.width = Math.round(img.naturalWidth * scale)
	canvas.height = Math.round(img.naturalHeight * scale)
	canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
	for (const quality of [0.82, 0.72, 0.6, 0.5]) {
		const data = canvas.toDataURL('image/webp', quality)
		if (bytesOf(data) <= MAX_BYTES) return { data, bytes: bytesOf(data) }
	}
	throw new Error(
		'La foto pesa demasiado aun comprimida. Prueba con otra o recórtala.'
	)
}
