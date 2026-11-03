import type { FormEvent, ReactNode } from 'react'

interface Props {
	id: string
	title: string
	lede: string
	busy: boolean
	onSubmit: (e: FormEvent<HTMLFormElement>) => void
	children: ReactNode
	action?: string | null
}

export function SettingsCard({
	id,
	title,
	lede,
	busy,
	onSubmit,
	children,
	action = 'Guardar',
}: Props) {
	return (
		<section
			className='settings-card animate-tile-in'
			aria-labelledby={`${id}-t`}>
			<header>
				<h2 className='h3' id={`${id}-t`}>
					{title}
				</h2>
				<p className='muted'>{lede}</p>
			</header>
			<form noValidate onSubmit={onSubmit}>
				{children}
				{action && (
					<div className='form-card__actions'>
						<button className='btn btn--grana' type='submit' disabled={busy}>
							{busy && <span className='spinner' aria-hidden='true' />}
							{action}
						</button>
					</div>
				)}
			</form>
		</section>
	)
}
