import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { Icon, type IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { CHISPA_URL } from '@/constants/stall'
import { useConfig } from '@/hooks/config/use_config'
import { useRules } from '@/hooks/wallet/use_wallet'
import type { Product } from '@/types/product_type'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

const STEPS = [
	['Eliges', 'algo del mercado que te alcance'],
	['Cambias', 'y se descuentan tus cacaos'],
	['Enseñas', 'el cupón donde se canjea'],
] as const

export function Explainer({ products }: { products: Product[] }) {
	const { data: config } = useConfig()
	const rules = useRules()
	const [open, setOpen] = useState(true)
	const [visible, setVisible] = useState(true)
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
	const facts: [IconName, string, string][] = [
		[
			'spark',
			'Lo ganas',
			'Cuando tu chispa avanza en Chispa, publicas un reto o tu encargado te da una insignia.',
		],
		[
			'store',
			'Lo cambias',
			'Por servicios y artículos de las empresas del grupo. Recibes un cupón con código.',
		],
		[
			'clock',
			`Dura ${months} meses`,
			'Desde que lo ganas. Al cambiar se usan primero los más viejos, para que no se te venzan.',
		],
	]

	const toggle = () => {
		window.clearTimeout(timer.current)
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
		if (visible) {
			setVisible(false)
			timer.current = window.setTimeout(() => setOpen(false), reduce ? 0 : 240)
			return
		}
		setOpen(true)
		timer.current = window.setTimeout(() => setVisible(true), 20)
	}

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
					<ul className='explainer__facts' role='list'>
						{facts.map(([ic, t, d], i) => (
							<li key={t} className='explainer__item' style={{ '--i': i }}>
								<Icon name={ic} />
								<span>
									<b>{t}</b>
									{d}
								</span>
							</li>
						))}
					</ul>
					<div className='explainer__more'>
						<div className='explainer__how'>
							<p className='kicker explainer__item' style={{ '--i': 3 }}>
								Así se usa
							</p>
							<ol className='explainer__steps' role='list'>
								{STEPS.map(([t, d], i) => (
									<li
										key={t}
										className='explainer__item'
										style={{ '--i': i + 3 }}>
										<span className='num'>{i + 1}</span>
										<span>
											<b>{t}</b> {d}
										</span>
									</li>
								))}
							</ol>
						</div>
						{done && cheapest && (
							<p
								className='explainer__example explainer__item'
								style={{ '--i': 6 }}>
								<Icon name='coins' />
								<span>
									Para que te des una idea: una chispa implementada da{' '}
									<b>{cacaos(done.cacaos)}</b> (≈{' '}
									{formatMoney(done.cacaos * value)}); lo más barato hoy es{' '}
									<b>{cheapest.name.toLowerCase()}</b> por{' '}
									{cacaos(cheapest.price)}.
								</span>
							</p>
						)}
						<div
							className='explainer__links explainer__item'
							style={{ '--i': 7 }}>
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
