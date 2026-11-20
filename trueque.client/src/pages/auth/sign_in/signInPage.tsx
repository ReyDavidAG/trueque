import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'

import { ConfirmStep } from '@/components/auth/confirmStep'
import { NumberStep } from '@/components/auth/numberStep'
import { StallsScene } from '@/components/auth/stallsScene'
import { SquishEgg } from '@/components/layout/squishEgg'
import { Wordmark } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/hooks/auth/useSession'
import type { Session } from '@/types/sessionType'

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
		const state: unknown = location.state
		const from =
			typeof state === 'object' &&
			state !== null &&
			'from' in state &&
			typeof state.from === 'string'
				? state.from
				: undefined
		confirm(pending)
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
					<SquishEgg />
					<Wordmark mark={null} />
				</span>
				<h1 className='display'>Tus ideas llenan tu despensa.</h1>
				<p className='lede'>
					Cada chispa que ayuda a resolver un reto te da yemas. Aquí las cambias
					por productos y servicios de las empresas del grupo.
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
				<StallsScene />
			</div>
		</div>
	)
}
