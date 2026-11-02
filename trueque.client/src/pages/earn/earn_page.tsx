import { Link } from 'react-router'

import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { RulesBoard } from '@/components/wallet/rules_board'
import { ROUTES } from '@/constants/routes'
import { useLiveProducts } from '@/hooks/market/use_market'
import { useLots, useRules } from '@/hooks/wallet/use_wallet'
import { cacaos } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { daysUntil, shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

const FAIR = [
	[
		'Lo grande lo decide una persona',
		'Los cacaos fuertes llegan cuando el comité selecciona o se implementa una chispa, no por mandar muchas.',
	],
	['Topes al mes', 'Mandar diez chispas iguales no paga diez veces.'],
	[
		'Cada empresa paga lo suyo',
		'Tu empresa cubre lo que canjeas; nadie paga premios de otra.',
	],
	[
		'Precios parejos',
		'RH revisa que un mismo producto cueste igual en todas las empresas.',
	],
]

const MONTHLY = 15

export default function EarnPage() {
	const rules = useRules()
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
			</header>
			<div className='earn-split'>
				<RulesBoard rules={rules.data ?? []} />
				<aside className='math-card'>
					<h2 className='h4'>Para darte una idea</h2>
					<p>
						Una chispa al mes que pasa a revisión da unos{' '}
						<b>{cacaos(MONTHLY)}</b>.
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
					<Link className='btn btn--grana btn--block' to={ROUTES.market}>
						Ver el mercado
					</Link>
				</aside>
			</div>
			<section className='section'>
				<h2 className='h3'>Tus cacaos y cuándo vencen</h2>
				<p className='muted'>
					Cada cacao vale 12 meses desde que lo ganas. Al hacer un trueque se
					usan primero los que vencen antes.
				</p>
				<ol className='lots' role='list'>
					{(lots.data ?? [])
						.filter(l => l.remaining > 0 && daysUntil(l.expiresOn) >= 0)
						.map((l, i) => (
							<li key={l.id} className='lot animate-row-in' style={stagger(i)}>
								<span className='lot__beans' aria-hidden='true'>
									<Coin />
								</span>
								<span className='lot__n num'>{l.remaining}</span>
								<span className='lot__src'>
									{l.sourceRef}
									<small>Ganado el {shortDate(l.createdAt)}</small>
								</span>
								<span
									className={cn(
										'lot__exp',
										daysUntil(l.expiresOn) <= 60 && 'is-soon'
									)}>
									<Icon name='clock' />
									{shortDate(l.expiresOn)}
								</span>
							</li>
						))}
				</ol>
			</section>
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
