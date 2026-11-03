import { type ReactNode, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { CHISPA_URL } from '@/constants/stall'
import { useConfig } from '@/hooks/config/use_config'
import { useRules } from '@/hooks/wallet/use_wallet'
import type { Product } from '@/types/product_type'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

import { TourScene } from './tour_scene'

type Slide = { title: string; text: string; note?: ReactNode }

export function Explainer({ products }: { products: Product[] }) {
	const { data: config } = useConfig()
	const rules = useRules()
	const [open, setOpen] = useState(false)
	const [visible, setVisible] = useState(false)
	const [step, setStep] = useState(0)
	const [dir, setDir] = useState(1)
	const [paused, setPaused] = useState(false)
	const timer = useRef<number>(0)
	const value = config?.cacaoValue ?? 5
	const months = config?.lotMonths ?? 12
	const done = rules.data?.find(r => r.code === 'done')
	const cheapest = useMemo(
		() =>
			products.reduce<Product | null>(
				(m, p) => (!m || p.price < m.price ? p : m),
				null
			),
		[products]
	)

	const slides: Slide[] = [
		{
			title: 'Lo ganas en Chispa',
			text: 'Cuando tu chispa avanza, publicas un reto o tu encargado te da una insignia.',
			note: done && (
				<>
					Una chispa implementada da <b>{cacaos(done.cacaos)}</b> (≈{' '}
					{formatMoney(done.cacaos * value)}).
				</>
			),
		},
		{
			title: 'Eliges algo que te alcance',
			text: 'Cada puesto del mercado tiene su precio en cacaos. Con "Sólo lo que me alcanza" ves lo que ya puedes cambiar.',
			note: cheapest && (
				<>
					Lo más barato hoy: <b>{cheapest.name.toLowerCase()}</b> por{' '}
					{cacaos(cheapest.price)}.
				</>
			),
		},
		{
			title: 'Haces el trueque',
			text: 'Se descuentan tus cacaos y recibes un cupón con código.',
		},
		{
			title: 'Enseñas tu cupón',
			text: 'Lo canjeas en el lugar de canje del producto y listo.',
		},
		{
			title: `Duran ${months} meses`,
			text: 'Desde que los ganas. Al cambiar se usan primero los más viejos, para que no se te venzan.',
		},
	]
	const last = slides.length - 1
	const current = slides[step]

	const go = (next: number) => {
		setDir(next >= step ? 1 : -1)
		setStep(Math.max(0, Math.min(last, next)))
	}

	const toggle = () => {
		window.clearTimeout(timer.current)
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
		if (visible) {
			setVisible(false)
			timer.current = window.setTimeout(() => setOpen(false), reduce ? 0 : 240)
			return
		}
		setStep(0)
		setDir(1)
		setPaused(false)
		setOpen(true)
		timer.current = window.setTimeout(() => setVisible(true), 20)
	}

	const stopped = paused || !visible

	return (
		<section
			className={cn(
				'explainer',
				visible && 'is-open',
				open && !visible && 'is-closing'
			)}
			aria-labelledby='explainer-title'>
			<button
				className='explainer__head'
				type='button'
				aria-expanded={visible}
				aria-controls='explainer-body'
				onClick={toggle}>
				<Coin className='explainer__coin' />
				<span>
					<b className='explainer__title' id='explainer-title'>
						¿Qué es un cacao?
					</b>
					<span className='explainer__value'>
						1 cacao vale <b className='num'>{formatMoney(value)}</b> en
						productos
					</span>
				</span>
				<Icon name='chevronDown' className='explainer__chev' />
			</button>
			{open && (
				<div className='explainer__body' id='explainer-body'>
					<div
						className='tour__rail explainer__item'
						role='tablist'
						aria-label='Pasos'
						style={{ '--i': 0 }}>
						{slides.map((s, i) => (
							<button
								key={s.title}
								type='button'
								role='tab'
								aria-selected={i === step}
								aria-controls='tour-panel'
								className={cn(
									'tour__tab',
									i === step && 'is-active',
									i < step && 'is-done'
								)}
								onClick={() => go(i)}>
								<span className='tour__track'>
									{i === step && (
										<span
											key={step}
											className={cn('tour__bar', stopped && 'is-paused')}
											onAnimationEnd={() => step < last && go(step + 1)}
										/>
									)}
								</span>
								<span className='tour__label'>
									<span className='num'>{i + 1}</span>
									{s.title}
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
						<div
							key={step}
							className='tour__slide'
							style={{ '--dir': dir }}>
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
								onClick={() => go(step - 1)}>
								<Icon name='arrowLeft' />
							</button>
							<button
								type='button'
								className='tour__ctl'
								aria-label={paused ? 'Reanudar recorrido' : 'Pausar recorrido'}
								onClick={() => setPaused(p => !p)}>
								<Icon name={paused ? 'play' : 'pause'} />
							</button>
							<button
								type='button'
								className='tour__ctl'
								aria-label='Paso siguiente'
								disabled={step === last}
								onClick={() => go(step + 1)}>
								<Icon name='arrowRight' />
							</button>
						</div>
						<div className='explainer__links'>
							<a
								className='btn btn--grana btn--sm'
								href={CHISPA_URL}
								target='_blank'
								rel='noopener'>
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
			)}
		</section>
	)
}
