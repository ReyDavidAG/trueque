import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router'

const LEAVE_MS = 150

type View = { key: string; el: ReactNode }

export function RouteFade() {
	const { pathname } = useLocation()
	const outlet = useOutlet()
	const [leaving, setLeaving] = useState<View | null>(null)
	const last = useRef<View>({ key: pathname, el: outlet })

	useLayoutEffect(() => {
		const before = last.current
		last.current = { key: pathname, el: outlet }
		if (
			before.key !== pathname &&
			!matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			setLeaving(before)
	})

	useEffect(() => {
		if (!leaving) return
		const id = window.setTimeout(() => setLeaving(null), LEAVE_MS)
		return () => window.clearTimeout(id)
	}, [leaving])

	if (leaving)
		return (
			<div key={leaving.key} className='route-leave' aria-hidden='true'>
				{leaving.el}
			</div>
		)
	return (
		<div key={pathname} className='route-enter'>
			{outlet}
		</div>
	)
}
