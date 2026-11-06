import { useRef } from 'react'

import { useMarketScene } from '@/hooks/ui/useMarketScene'

export function MarketScene() {
	const host = useRef<HTMLDivElement>(null)
	useMarketScene(host)
	return <div ref={host} className='scene3d-host' />
}
