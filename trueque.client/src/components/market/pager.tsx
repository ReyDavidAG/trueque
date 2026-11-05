import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'

interface Props {
	page: number
	pages: number
	total: number
	size: number
	onPage: (page: number) => void
}

const visible = (page: number, pages: number) => {
	const out: (number | null)[] = []
	for (let i = 0; i < pages; i++) {
		if (i === 0 || i === pages - 1 || Math.abs(i - page) <= 1) out.push(i)
		else if (out[out.length - 1] !== null) out.push(null)
	}
	return out
}

export function Pager({ page, pages, total, size, onPage }: Props) {
	if (pages < 2) return null
	const from = page * size + 1
	const to = Math.min(total, from + size - 1)
	return (
		<nav className='pager' aria-label='Páginas del mercado'>
			<p className='pager__count muted' aria-live='polite'>
				Puestos <b className='num'>{from}</b>–<b className='num'>{to}</b> de{' '}
				<b className='num'>{total}</b>
			</p>
			<div className='pager__row'>
				<button
					type='button'
					className='pager__btn'
					disabled={page === 0}
					onClick={() => onPage(page - 1)}>
					<Icon name='arrowLeft' />
					<span className='pager__word'>Anterior</span>
				</button>
				{visible(page, pages).map((i, k) =>
					i === null ? (
						<span key={`gap${k}`} className='pager__gap' aria-hidden='true'>
							…
						</span>
					) : (
						<button
							key={i}
							type='button'
							className={cn('pager__num num', i === page && 'is-current')}
							aria-current={i === page ? 'page' : undefined}
							aria-label={`Página ${i + 1}`}
							onClick={() => onPage(i)}>
							{i + 1}
						</button>
					)
				)}
				<button
					type='button'
					className='pager__btn'
					disabled={page === pages - 1}
					onClick={() => onPage(page + 1)}>
					<span className='pager__word'>Siguiente</span>
					<Icon name='arrowRight' />
				</button>
			</div>
		</nav>
	)
}
