import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { LotsSection } from '@/components/wallet/lotsSection'
import { RulesBoard } from '@/components/wallet/rulesBoard'
import { ROUTES } from '@/constants/routes'
import { CHISPA_URL } from '@/constants/stall'
import { useConfig } from '@/hooks/config/useConfig'
import { useLiveProducts } from '@/hooks/market/useMarket'
import { useLots, useRules } from '@/hooks/wallet/useWallet'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

const FAIR = [
	[
		'Lo grande lo decide una persona',
		'Los cacaos fuertes llegan cuando el comité selecciona o se implementa una chispa, no por mandar muchas.',
	],
	['Topes al mes', 'Mandar diez chispas iguales no paga diez veces.'],
	[
		'Paga quien ofrece',
		'Cada empresa cubre, con su presupuesto, lo que su puesto entrega. Nadie paga premios de otra.',
	],
	[
		'Precios parejos',
		'RH revisa que un mismo producto cueste igual en todas las empresas.',
	],
]

const MONTHLY = 15

export default function EarnPage() {
	const rules = useRules()
	const { data: config } = useConfig()
	const cacaoValue = config?.cacaoValue ?? 5
	const lots = useLots()
	const { live } = useLiveProducts()
	const examples = [...live]
		.sort((a, b) => a.price - b.price)
		.filter(
			(_, i, a) =>
				i === 0 || i === Math.floor(a.length / 2) || i === a.length - 1
		)

	return (
		<div className='wrap'>
			<header className='page-head'>
				<h1 className='h1'>Cómo gano cacaos</h1>
				<p className='lede'>
					En Mesoamérica el cacao fue moneda. Aquí también: lo ganas cuando
					ayudas a resolver un problema de la operación.
				</p>
				<a
					className='chispa-link'
					href={CHISPA_URL}
					target='_blank'
					rel='noopener'>
					<Icon name='spark' />
					<span>
						<b>Ve los retos abiertos en Chispa</b>
						Cada idea que mandas es tu primer cacao.
					</span>
					<Icon name='arrowRight' />
				</a>
			</header>
			<div className='earn-split'>
				<RulesBoard
					rules={(rules.data ?? []).filter(r => r.isActive)}
					cacaoValue={cacaoValue}
				/>
				<aside className='math-card'>
					<h2 className='h4'>Para darte una idea</h2>
					<p>
						Una chispa al mes que pasa a revisión da unos{' '}
						<b>{cacaos(MONTHLY)}</b> (≈ {formatMoney(MONTHLY * cacaoValue)}).
					</p>
					<ul className='math-card__list' role='list'>
						{examples.map(p => (
							<li key={p.id}>
								<span>{p.name}</span>
								<span className='num'>
									≈ {Math.max(1, Math.round(p.price / MONTHLY))} meses
								</span>
							</li>
						))}
					</ul>
					<p className='muted small'>
						Una chispa que llega a la feria adelanta todo eso de golpe.
					</p>
					<a
						className='btn btn--grana btn--block'
						href={CHISPA_URL}
						target='_blank'
						rel='noopener'>
						<Icon name='spark' />
						Proponer una chispa
						<Icon name='arrowRight' />
					</a>
					<Link className='btn btn--ghost btn--block' to={ROUTES.market}>
						Ver el mercado
					</Link>
				</aside>
			</div>
			<LotsSection lots={lots.data ?? []} months={config?.lotMonths ?? 12} />
			<section className='section'>
				<h2 className='h3'>Para que sea parejo</h2>
				<ul className='fair' role='list'>
					{FAIR.map(([t, d], i) => (
						<li key={t} className='animate-tile-in' style={stagger(i)}>
							<b>{t}</b>
							<span>{d}</span>
						</li>
					))}
				</ul>
			</section>
		</div>
	)
}
