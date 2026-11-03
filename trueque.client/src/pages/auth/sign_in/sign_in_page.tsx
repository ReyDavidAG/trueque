import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'

import { ConfirmStep } from '@/components/auth/confirm_step'
import { NumberStep } from '@/components/auth/number_step'
import { MarketScene, Wordmark } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/hooks/auth/use_session'
import type { Session } from '@/types/session_type'

export default function SignInPage() {
	const { session, signIn, confirm, signOut } = useSession()
	const navigate = useNavigate()
	const location = useLocation()
	const [pending, setPending] = useState<Session | null>(null)
	const [number, setNumber] = useState('')
	const [error, setError] = useState<string | null>(null)

	if (session && !pending) return <Navigate to={ROUTES.market} replace />

	const lookUp = async (employeeNumber: string) => {
		setNumber(employeeNumber)
		setError(null)
		try {
			setPending(await signIn(employeeNumber))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'No se pudo entrar.')
		}
	}

	const enter = () => {
		if (!pending) return
		confirm(pending)
		const state: unknown = location.state
		const from =
			typeof state === 'object' &&
			state !== null &&
			'from' in state &&
			typeof state.from === 'string'
				? state.from
				: undefined
		navigate(from && from !== ROUTES.signIn ? from : ROUTES.market, {
			replace: true,
		})
	}

	const back = async () => {
		await signOut()
		setPending(null)
	}

	return (
		<div className='signin'>
			<section className='signin__story'>
				<span className='signin__brand'>
					<Wordmark />
				</span>
				<h1 className='display'>Lo que propones vale cacao.</h1>
				<p className='lede'>
					Cada chispa que ayuda a resolver un reto te da cacaos. Aquí los
					cambias por servicios y artículos de las empresas del grupo.
				</p>
			</section>
			<section className='signin__panel'>
				{pending ? (
					<ConfirmStep session={pending} onConfirm={enter} onBack={back} />
				) : (
					<NumberStep
						defaultValue={number}
						serverError={error}
						onSubmit={lookUp}
					/>
				)}
			</section>
			<div className='signin__scene'>
				<MarketScene />
			</div>
		</div>
	)
}
