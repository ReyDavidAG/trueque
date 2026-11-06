import { useState } from 'react'

import { Icon } from '@/components/ui/icon'
import type { ProductImage } from '@/types/productType'
import { cn } from '@/utils/cn'
import { compressImage, MAX_IMAGES } from '@/utils/images'

interface Props {
	images: ProductImage[]
	onChange: (images: ProductImage[]) => void
}

export function PhotoField({ images, onChange }: Props) {
	const [error, setError] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)

	const add = async (file: File | undefined) => {
		if (!file) return
		setBusy(true)
		setError(null)
		try {
			const img = await compressImage(file)
			onChange([...images, { position: images.length + 1, ...img }])
		} catch (e) {
			setError(e instanceof Error ? e.message : 'No pudimos usar esa foto.')
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className='field'>
			<span className='field__label'>
				Fotos <span className='muted'>(hasta {MAX_IMAGES})</span>
			</span>
			<div className={cn('upload', error && 'animate-nudge')}>
				{images.map((img, i) => (
					<figure
						key={img.data.slice(-24)}
						className='upload__pic animate-tile-in'>
						<img src={img.data} alt={`Foto ${i + 1}`} />
						<figcaption className='num'>
							{Math.ceil(img.bytes / 1024)} KB
						</figcaption>
						<button
							className='upload__remove'
							type='button'
							aria-label={`Quitar foto ${i + 1}`}
							onClick={() => onChange(images.filter((_, j) => j !== i))}>
							<Icon name='x' />
						</button>
					</figure>
				))}
				{images.length < MAX_IMAGES && (
					<label className='upload__add' htmlFor='p-photo'>
						{busy ? (
							<span className='spinner' aria-hidden='true' />
						) : (
							<Icon name='camera' />
						)}
						<b>
							{busy
								? 'Reduciendo…'
								: images.length
									? 'Agregar otra'
									: 'Subir foto'}
						</b>
						<small>PNG, JPG o WebP</small>
						<input
							id='p-photo'
							type='file'
							accept='image/png,image/jpeg,image/webp'
							className='sr-only'
							onChange={e => {
								void add(e.target.files?.[0])
								e.target.value = ''
							}}
						/>
					</label>
				)}
			</div>
			<p className={cn('field__help', error && 'is-error')}>
				{error ??
					'Se reducen solas a menos de 300 KB. Si no subes foto, se usa la ilustración.'}
			</p>
		</div>
	)
}
