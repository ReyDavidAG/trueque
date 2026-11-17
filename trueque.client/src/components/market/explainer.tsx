import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { useExplainer } from '@/hooks/market/useExplainer'
import { useExplainerSlides } from '@/hooks/market/useExplainerSlides'
import type { Product } from '@/types/productType'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

import { ExplainerTour } from './explainerTour'

export function Explainer({ products }: { products: Product[] }) {
	const { slides, cacaoValue, lotMonths } = useExplainerSlides(products)
	const tour = useExplainer(slides.length)
	const opener = useRef<HTMLButtonElement>(null)
	const closer = useRef<HTMLButtonElement>(null)
	const { open, visible, toggle } = tour
	const latestToggle = useRef(toggle)

	useEffect(() => {
		latestToggle.current = toggle
	})

	useEffect(() => {
		if (!open) return
		closer.current?.focus()
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return
			latestToggle.current()
			opener.current?.focus()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [open])

	const close = () => {
		toggle()
		opener.current?.focus()
	}

	return (
		<section
			className={cn('explainer', visible && 'is-open')}
			aria-labelledby='explainer-title'>
			<button
				ref={opener}
				className='explainer__head'
				type='button'
				aria-haspopup='dialog'
				aria-expanded={visible}
				onClick={toggle}>
				<Coin className='explainer__coin' />
				<span>
					<b className='explainer__title' id='explainer-title'>
						¿Qué es una yema?
					</b>
					<span className='explainer__value'>
						1 yema = <b className='num'>{formatMoney(cacaoValue)}</b> en
						productos · dura {lotMonths} meses
					</span>
				</span>
				<Icon name='chevronDown' className='explainer__chev' />
			</button>
			{open &&
				createPortal(
					<div
						className={cn(
							'explainer-modal',
							visible && 'is-open',
							!visible && 'is-closing'
						)}
						onClick={e => e.target === e.currentTarget && close()}>
						<div
							className={cn(
								'explainer explainer-modal__card',
								visible && 'is-open',
								!visible && 'is-closing'
							)}
							role='dialog'
							aria-modal='true'
							aria-labelledby='explainer-modal-title'>
							<div className='explainer-modal__head'>
								<Coin className='explainer__coin' />
								<span>
									<b className='explainer__title' id='explainer-modal-title'>
										¿Qué es una yema?
									</b>
									<span className='explainer__value'>
										1 yema = <b className='num'>{formatMoney(cacaoValue)}</b> en
										productos · dura {lotMonths} meses
									</span>
								</span>
								<button
									ref={closer}
									className='explainer-modal__close'
									type='button'
									aria-label='Cerrar'
									onClick={close}>
									<Icon name='x' />
								</button>
							</div>
							<ExplainerTour slides={slides} tour={tour} />
						</div>
					</div>,
					document.body
				)}
		</section>
	)
}
