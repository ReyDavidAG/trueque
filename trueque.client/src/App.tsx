import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { SessionProvider } from '@/context/session/sessionContext'
import LoadingPage from '@/pages/core/loading/loadingPage'
import { queryClient } from '@/services/api/queryClient'
import { installTabFace } from '@/utils/tabFace'

import router from './router/appRouter'

installTabFace(
	fn => router.subscribe(state => fn(state.location.pathname)),
	router.state.location.pathname
)

const App = () => (
	<QueryClientProvider client={queryClient}>
		<SessionProvider>
			<Suspense fallback={<LoadingPage />}>
				<RouterProvider router={router} />
			</Suspense>
			<Toaster position='bottom-center' />
		</SessionProvider>
	</QueryClientProvider>
)

export default App
