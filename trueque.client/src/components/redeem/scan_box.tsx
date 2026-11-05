import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'

export function ScanBox({ onCode }: { onCode: (code: string) => void }) {
	const video = useRef<HTMLVideoElement>(null)
	const handler = useRef(onCode)
	const [on, setOn] = useState(false)
	const [message, setMessage] = useState<string | null>(null)

	useEffect(() => {
		handler.current = onCode
	}, [onCode])

	useEffect(() => {
		if (!on) return
		const Detector = window.BarcodeDetector
		if (!Detector) return
		let stream: MediaStream | null = null
		let timer = 0
		const detector = new Detector({ formats: ['qr_code'] })
		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: 'environment' } })
			.then(s => {
				stream = s
				if (!video.current) return
				video.current.srcObject = s
				void video.current.play()
				timer = window.setInterval(async () => {
					if (!video.current) return
					const found = await detector.detect(video.current).catch(() => [])
					if (found[0]) {
						setOn(false)
						handler.current(found[0].rawValue)
					}
				}, 350)
			})
			.catch(() => {
				setOn(false)
				setMessage('No pudimos abrir la cámara. Escribe el código.')
			})
		return () => {
			window.clearInterval(timer)
			stream?.getTracks().forEach(t => t.stop())
		}
	}, [on])

	const start = () => {
		if (!window.BarcodeDetector || !navigator.mediaDevices) {
			setMessage(
				'Este navegador no lee códigos QR. Escribe el código de abajo.'
			)
			return
		}
		setMessage(null)
		setOn(true)
	}

	return (
		<>
			<button
				className={cn('scan', on && 'is-on')}
				type='button'
				aria-pressed={on}
				onClick={() => (on ? setOn(false) : start())}>
				{on && (
					<video
						ref={video}
						className='scan__video'
						muted
						playsInline
						aria-hidden='true'
					/>
				)}
				<span className='scan__frame' aria-hidden='true'>
					{!on && (
						<svg className='scan__qr' viewBox='0 0 7 7'>
							<path d='M0 0h3v3H0zM4 0h3v3H4zM0 4h3v3H0zM4 4h1v1H4zM6 4h1v1H6zM5 5h1v1H5zM4 6h1v1H4zM6 6h1v1H6z' />
							<path className='scan__qr-hole' d='M1 1h1v1H1zM5 1h1v1H5zM1 5h1v1H1z' />
						</svg>
					)}
					<i />
					<i />
					<i />
					<i />
					<span className='scan__line' />
				</span>
				<span className='scan__text'>
					<Icon name='camera' />
					{on
						? 'Apunta al código QR… (toca para cerrar)'
						: 'Escanear con la cámara'}
				</span>
			</button>
			{message && <p className='field__help is-error'>{message}</p>}
		</>
	)
}
