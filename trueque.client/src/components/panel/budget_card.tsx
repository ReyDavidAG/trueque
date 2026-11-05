import { useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { useCountUp } from '@/hooks/ui/use_count_up'
import type { Budget } from '@/types/panel_type'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

import { VaultCoins } from './vault_coins'

const KEY = 'trueque.safe-open'

const readOpen = () => {
	try {
		return localStorage.getItem(KEY) === '1'
	} catch {
		return false
	}
}

function Figures({ budget, shown }: { budget: Budget; shown: number }) {
	const free = Math.max(0, budget.available)
	const pct = (n: number) =>
		`${budget.assigned ? Math.min(100, (n / budget.assigned) * 100).toFixed(1) : 0}%`
	return (
		<>
			<p className='budget__total'>
				<b className='num'>{formatMoney(shown)}</b> libres de{' '}
				{formatMoney(budget.assigned)}
			</p>
			<div
				className='budget__bar'
				role='img'
				aria-label={`Canjeado ${formatMoney(budget.redeemed)}, en cupones vigentes ${formatMoney(budget.committed)}, libre ${formatMoney(free)}`}>
				<span className='is-redeemed' style={{ width: pct(budget.redeemed) }} />
				<span
					className='is-committed'
					style={{ width: pct(budget.committed) }}
				/>
			</div>
			<dl className='budget__legend'>
				<div>
					<dt>
						<i className='is-redeemed' />
						Canjeado
					</dt>
					<dd className='num'>{formatMoney(budget.redeemed)}</dd>
				</div>
				<div>
					<dt>
						<i className='is-committed' />
						En cupones vigentes
					</dt>
					<dd className='num'>{formatMoney(budget.committed)}</dd>
				</div>
				<div>
					<dt>
						<i />
						Libre
					</dt>
					<dd className='num'>{formatMoney(free)}</dd>
				</div>
			</dl>
			<p className='budget__note'>
				<Icon name='info' />
				Cada canje de tus productos se descuenta con su costo real en pesos.
			</p>
		</>
	)
}

export function BudgetCard({
	budget,
	companyName,
}: {
	budget: Budget
	companyName?: string
}) {
	const free = Math.max(0, budget.available)
	const shown = useCountUp(free, 250)
	return (
		<section className='budget'>
			<div className='budget__head'>
				<h2 className='h4'>
					Presupuesto {budget.period}
					{companyName && ` · ${companyName}`}
				</h2>
				<span className='tag-example'>Prueba</span>
			</div>
			<Figures budget={budget} shown={shown} />
		</section>
	)
}

export function BudgetVault({ budget }: { budget: Budget }) {
	const [open, setOpen] = useState(readOpen)
	const free = Math.max(0, budget.available)
	const shown = useCountUp(open ? free : 0, 900)
	const toggle = () => {
		setOpen(!open)
		try {
			localStorage.setItem(KEY, open ? '0' : '1')
		} catch {
			return
		}
	}
	return (
		<section className={cn('vault', open && 'is-open')} aria-label={`Presupuesto ${budget.period}`}>
			<div className='vault__inside' inert={!open}>
				<div className='vault__data budget'>
					<div className='budget__head'>
						<h2 className='h4'>Presupuesto {budget.period}</h2>
						<span className='tag-example'>Prueba</span>
						<button type='button' className='btn btn--sm btn--ghost vault__close' onClick={toggle}>
							<Icon name='lock' />
							Cerrar
						</button>
					</div>
					<Figures key={String(open)} budget={budget} shown={shown} />
				</div>
				<div className='vault__tray'>
					<VaultCoins active={open} free={free} total={budget.assigned} />
					<span className='vault__hint small'>Pasa el mouse o toca para mover las monedas</span>
				</div>
				<div className='vault__drawers' aria-hidden='true'>
					<span>Comprobantes</span>
					<span>Reserva</span>
				</div>
			</div>
			<button
				type='button'
				className='vault__door'
				aria-expanded={open}
				aria-label='Abrir la caja fuerte del presupuesto'
				inert={open}
				onClick={toggle}>
				<span className='vault__bolts' aria-hidden='true'>
					<i />
					<i />
					<i />
					<i />
				</span>
				<span className='vault__panel' aria-hidden='true'>
					<span className='vault__etch'>
						<span className='vault__etch-kicker'>Presupuesto {budget.period}</span>
						<span className='vault__etch-title'>Caja fuerte</span>
						<span className='vault__etch-line'>Ábrela para ver cuánto queda</span>
					</span>
					<span className='vault__plate'>El Trueque</span>
					<span className='vault__lock'>
						<span className='vault__dial' />
						<span className='vault__wheel'>
							<i />
							<i />
						</span>
					</span>
					<span className='vault__open small'>
						<Icon name='unlock' />
						Abrir
					</span>
				</span>
				<span className='vault__hinges' aria-hidden='true'>
					<i />
					<i />
				</span>
			</button>
		</section>
	)
}
