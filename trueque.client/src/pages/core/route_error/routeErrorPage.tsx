import { Art } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'

export default function RouteErrorPage() {
	return (
		<div className='wrap narrow'>
			<div className='empty empty--error'>
				<div className='empty__art'>
					<Art id='closed' />
				</div>
				<h1 className='h2'>Algo se nos cayó del puesto</h1>
				<p className='muted'>Recarga la página o vuelve al mercado.</p>
				<a className='btn btn--grana' href={ROUTES.market}>
					Volver al mercado
				</a>
			</div>
		</div>
	)
}
