import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { CHISPA_URL } from '@/constants/stall'
import type { ExplainerState } from '@/hooks/market/use_explainer'
import type { ExplainerSlide } from '@/hooks/market/use_explainer_slides'
import { cn } from '@/utils/cn'

import { TourScene } from './tour_scene'

interface ExplainerTourProps {
	slides: ExplainerSlide[]
	tour: ExplainerState
}

export function ExplainerTour({ slides, tour }: ExplainerTourProps) {
	const { step, last } = tour
	const current = slides[step]

	return (
		<div className='explainer__body' id='explainer-body'>
			<div
				className='tour__rail explainer__item'
				role='tablist'
				aria-label='Pasos'
				style={{ '--i': 0 }}>
				{slides.map((slide, i) => (
					<button
						key={slide.title}
						type='button'
						role='tab'
						aria-selected={i === step}
						aria-controls='tour-panel'
						className={cn('tour__tab', i === step && 'is-active', i < step && 'is-done')}
						onClick={() => tour.go(i)}>
						<span className='tour__track'>
							{i === step && (
								<span
									key={step}
									className={cn('tour__bar', tour.stopped && 'is-paused')}
									onAnimationEnd={tour.advance}
								/>
							)}
						</span>
						<span className='tour__label'>
							<span className='num'>{i + 1}</span>
							{slide.title}
						</span>
					</button>
				))}
			</div>
			<div
				className='tour__stage explainer__item'
				id='tour-panel'
				role='tabpanel'
				aria-live='polite'
				style={{ '--i': 1 }}>
				<TourScene step={step} />
				<div key={step} className='tour__slide' style={{ '--dir': tour.direction }}>
					<div className='tour__copy'>
						<p className='kicker'>
							Paso {step + 1} de {slides.length}
						</p>
						<h3 className='tour__title'>{current.title}</h3>
						<p className='tour__text'>{current.text}</p>
						{current.note && (
							<p className='tour__note'>
								<Icon name='coins' />
								<span>{current.note}</span>
							</p>
						)}
					</div>
				</div>
			</div>
			<div className='tour__foot explainer__item' style={{ '--i': 2 }}>
				<div className='tour__controls'>
					<button
						type='button'
						className='tour__ctl'
						aria-label='Paso anterior'
						disabled={step === 0}
						onClick={() => tour.go(step - 1)}>
						<Icon name='arrowLeft' />
					</button>
					<button
						type='button'
						className='tour__ctl'
						aria-label={tour.paused ? 'Reanudar recorrido' : 'Pausar recorrido'}
						onClick={tour.togglePause}>
						<Icon name={tour.paused ? 'play' : 'pause'} />
					</button>
					<button
						type='button'
						className='tour__ctl'
						aria-label='Paso siguiente'
						disabled={step === last}
						onClick={() => tour.go(step + 1)}>
						<Icon name='arrowRight' />
					</button>
				</div>
				<div className='explainer__links'>
					<a className='btn btn--grana btn--sm' href={CHISPA_URL} target='_blank' rel='noopener'>
						<Icon name='spark' />
						Proponer una chispa
						<Icon name='arrowRight' />
					</a>
					<Link className='btn btn--ghost btn--sm' to={ROUTES.earn}>
						Cómo gano más
					</Link>
				</div>
			</div>
		</div>
	)
}
