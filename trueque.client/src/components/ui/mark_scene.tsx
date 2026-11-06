import { useRef } from 'react'

import { useMarkScene } from '@/hooks/ui/use_mark_scene'

export function MarkScene() {
	const host = useRef<HTMLSpanElement>(null)
	useMarkScene(host)
	return <span ref={host} className='mark mark3d' aria-hidden='true' />
}
