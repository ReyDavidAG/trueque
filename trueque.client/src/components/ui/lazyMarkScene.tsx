import { lazy, Suspense } from 'react'

const MarkScene = lazy(() =>
	import('@/components/ui/markScene').then(module => ({
		default: module.MarkScene,
	}))
)

export function LazyMarkScene() {
	return (
		<Suspense fallback={<span className='mark mark3d' aria-hidden='true' />}>
			<MarkScene />
		</Suspense>
	)
}
