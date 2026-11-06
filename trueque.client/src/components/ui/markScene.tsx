import { useRef } from 'react'

import { useMarkScene } from '@/hooks/ui/useMarkScene'

export function MarkScene() {
	const host = useRef<HTMLSpanElement>(null)
	useMarkScene(host)
	return <span ref={host} className='mark mark3d' aria-hidden='true' />
}
