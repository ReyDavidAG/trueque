import { Suspense, useMemo } from 'react'
import { ScrollRestoration } from 'react-router'

import { navItems } from '@/components/layout/nav_items'
import { RouteFade } from '@/components/layout/route_fade'
import { TabBar } from '@/components/layout/tab_bar'
import { TopBar } from '@/components/layout/top_bar'
import { Icon } from '@/components/ui/icon'
import { useRequiredSession } from '@/hooks/auth/use_session'
import LoadingPage from '@/pages/core/loading/loading_page'

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
