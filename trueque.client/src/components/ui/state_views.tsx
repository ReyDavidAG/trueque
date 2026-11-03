import type { ReactNode } from 'react'

import { Art } from './art'
import { ClosedStall } from './closed_stall'
import { Icon } from './icon'

export function EmptyState({
	art = 'ticket',
	title,
	body,
	action,
	onAngry,
}: {
	art?: string
	title: string
	body: string
	action?: ReactNode
	onAngry?: () => void
}) {
	return (
		<div className='empty'>
			<div className='empty__art'>
				{art === 'closed' ? (
					<ClosedStall onAngry={onAngry} />
				) : (
					<Art id={art} />
				)}
			</div>
			<p className='h3'>{title}</p>
			<p className='muted'>{body}</p>
			{action}
		</div>
	)
}

export function ErrorState({
	message,
	onRetry,
}: {
	message: string
	onRetry: () => void
}) {
	return (
		<div className='empty empty--error' role='alert'>
			<div className='empty__art'>
				<Art id='closed' />
			</div>
			<p className='h3'>No pudimos abrir el mercado</p>
			<p className='muted'>
				{message} Tus cacaos están a salvo: no se movió nada.
			</p>
			<button className='btn btn--grana' type='button' onClick={onRetry}>
				<Icon name='refresh' />
				Reintentar
			</button>
		</div>
	)
}

export function StallSkeletons({ count = 4 }: { count?: number }) {
	return (
		<div className='stalls' aria-busy='true' aria-label='Cargando el mercado'>
			{Array.from({ length: count }, (_, i) => (
				<div key={i} className='stall stall--ghost' style={{ '--i': i }}>
					<div className='ghost ghost--awning' />
					<div className='ghost ghost--art' />
					<div className='ghost ghost--line' />
					<div className='ghost ghost--line is-short' />
				</div>
			))}
		</div>
	)
}

export function DemoNote({ children }: { children: ReactNode }) {
	return (
		<p className='demo-note'>
			<Icon name='info' />
			<span>{children}</span>
		</p>
	)
}
