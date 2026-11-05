import { useEffect, useRef } from 'react'

import { Art, Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import { cacaos, formatMoney } from '@/utils/cacaos'

interface Props {
	open: boolean
	editing: boolean
	pending: boolean
	values: ProductForm
	categoryName: string
	locationName?: string
	photos: number
	onCancel: () => void
	onConfirm: () => void
}

const date = (v: string) =>
	v
		? new Date(`${v}T12:00:00`).toLocaleDateString('es-MX', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			})
		: null

export function ConfirmPublish({
	open,
	editing,
	pending,
	values: v,
	categoryName,
	locationName,
	photos,
	onCancel,
	onConfirm,
}: Props) {
	const ref = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const d = ref.current
		if (!d) return
		if (open && !d.open) d.showModal()
		if (!open && d.open) d.close()
	}, [open])

	const swaps = Number(v.swaps) || 1
	const includes = v.includes.split('\n').filter(x => x.trim())
	const from = date(v.availableFrom)
	const until = date(v.availableUntil)
	const rows: [string, string][] = [
		['Categoría', categoryName],
		['Tipo', v.kind === 'service' ? 'Servicio' : 'Artículo'],
		['Precio', cacaos(Number(v.price))],
		['Costo para tu empresa', formatMoney(Number(v.cost))],
		['Existencias', v.stock === '' ? 'Sin límite' : v.stock],
		['El cupón vale', `${v.couponDays} días · ${swaps} ${swaps === 1 ? 'uso' : 'usos'}`],
		[
			'Disponible',
			from || until
				? `${from ?? 'en cuanto RH lo apruebe'} – ${until ?? 'hasta que lo pauses'}`
				: 'En cuanto RH lo apruebe',
		],
		['Se canjea en', locationName ?? '—'],
		['Fotos', photos ? String(photos) : 'Sin fotos, se usa el diseño'],
	]

	return (
		<dialog
			ref={ref}
			className='confirm-pub'
			aria-labelledby='confirm-pub-title'
			onCancel={e => {
				e.preventDefault()
				if (!pending) onCancel()
			}}>
			<div className='confirm-pub__body'>
				<header className='confirm-pub__head'>
					<Coin className='confirm-pub__coin' />
					<div>
						<h2 className='h3' id='confirm-pub-title'>
							{editing ? '¿Guardamos los cambios?' : '¿Seguro que lo subes?'}
						</h2>
						<p className='muted'>
							{editing
								? 'Revisa el resumen antes de guardar.'
								: 'Se manda a RH para que apruebe el precio. Revisa que todo esté bien.'}
						</p>
					</div>
				</header>

				<div className='confirm-pub__grid'>
					<div className='confirm-pub__look' data-stall={v.stall}>
						<div className='stall__awning' aria-hidden='true' />
						<div className='confirm-pub__art'>
							<Art id={v.art} label={v.name} />
						</div>
						<PriceSign price={Number(v.price) || 0} className='confirm-pub__sign' />
					</div>
					<div className='confirm-pub__info'>
						<p className='confirm-pub__name'>{v.name}</p>
						<p className='muted'>{v.blurb}</p>
						{includes.length > 0 && (
							<ul className='confirm-pub__includes' role='list'>
								{includes.map(x => (
									<li key={x}>
										<Icon name='check' />
										{x}
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				<dl className='confirm-pub__rows'>
					{rows.map(([k, val], i) => (
						<div key={k} style={{ '--i': i }}>
							<dt>{k}</dt>
							<dd>{val}</dd>
						</div>
					))}
				</dl>

				<div className='confirm-pub__actions'>
					<button
						type='button'
						className='btn btn--ghost'
						disabled={pending}
						onClick={onCancel}>
						<Icon name='arrowLeft' />
						Revisar otra vez
					</button>
					<button
						type='button'
						className='btn btn--grana'
						disabled={pending}
						onClick={onConfirm}>
						{pending ? (
							<span className='spinner' aria-hidden='true' />
						) : (
							<Icon name='shield' />
						)}
						{pending
							? 'Mandando…'
							: editing
								? 'Sí, guardar'
								: 'Sí, mandarlo a RH'}
					</button>
				</div>
			</div>
		</dialog>
	)
}
