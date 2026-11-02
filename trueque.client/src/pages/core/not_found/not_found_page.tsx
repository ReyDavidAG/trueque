import { Link } from 'react-router'

import { Art } from '@/components/ui/art'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
	return (
		<div className='wrap narrow'>
			<div className='empty empty--error'>
				<div className='empty__art'>
					<Art id='closed' />
				</div>
				<p className='kicker'>Error 404</p>
				<h1 className='h2'>Este puesto no existe</h1>
				<p className='muted'>
					Puede que la liga esté incompleta o que el producto ya no se ofrezca.
				</p>
				<Link className='btn btn--grana' to={ROUTES.market}>
					Volver al mercado
				</Link>
			</div>
		</div>
	)
}
