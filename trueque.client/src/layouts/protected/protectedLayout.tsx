import { Suspense, useMemo } from 'react'
import { ScrollRestoration } from 'react-router'

import { navItems } from '@/components/layout/navItems'
import { RouteFade } from '@/components/layout/routeFade'
import { TabBar } from '@/components/layout/tabBar'
import { TopBar } from '@/components/layout/topBar'
import { Icon } from '@/components/ui/icon'
import { useRequiredSession } from '@/hooks/auth/useSession'
import LoadingPage from '@/pages/core/loading/loadingPage'

export default function ProtectedLayout() {
	const session = useRequiredSession()
	const items = useMemo(() => navItems(session.role), [session.role])

	return (
		<>
			<a className='skip-link' href='#main'>
				Saltar al contenido
			</a>
			<TopBar items={items} />
			<div className='demo-ribbon' role='note'>
				<Icon name='info' />
				<span>Demo de El Trueque · cacaos y productos de prueba</span>
			</div>
			<main id='main' className='page' tabIndex={-1}>
				<Suspense fallback={<LoadingPage />}>
					<RouteFade />
				</Suspense>
			</main>
			<TabBar items={items} />
			<ScrollRestoration />
		</>
	)
}
