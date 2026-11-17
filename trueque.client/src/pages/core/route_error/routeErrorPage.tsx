import { Art } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'

export default function RouteErrorPage() {
	return (
		<div className='wrap narrow'>
			<div className='empty empty--error'>
				<div className='empty__art'>
					<Art id='closed' />
				</div>
				<h1 className='h2'>Algo se nos cayó de la despensa</h1>
				<p className='muted'>Recarga la página o vuelve a la despensa.</p>
				<a className='btn btn--grana' href={ROUTES.market}>
					Volver a la despensa
				</a>
			</div>
		</div>
	)
}
