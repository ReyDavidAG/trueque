import { useRef } from 'react'

import { useTourScene } from '@/hooks/ui/useTourScene'

export function TourScene({ step }: { step: number }) {
	const host = useRef<HTMLDivElement>(null)
	useTourScene(host, step)
	return <div ref={host} className='tour__visor' aria-hidden='true' />
}
