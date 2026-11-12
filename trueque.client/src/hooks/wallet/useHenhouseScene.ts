import { useEffect, useRef, useState } from 'react'

import { mountHenhouseScene } from '@/components/wallet/henhouseScene'
import type { HenFlock, HenhouseTip } from '@/types/henhouseType'

export function useHenhouseScene(flocks: HenFlock[]) {
	const host = useRef<HTMLDivElement>(null)
	const labels = useRef<(HTMLLIElement | null)[]>([])
	const [tip, setTip] = useState<HenhouseTip | null>(null)

	useEffect(() => {
		const element = host.current
		if (!element || !flocks.length) return
		return mountHenhouseScene({
			host: element,
			flocks,
			labels: labels.current,
			onTip: setTip,
		})
	}, [flocks])

	const labelRef = (index: number) => (node: HTMLLIElement | null) => {
		labels.current[index] = node
	}

	return { host, labelRef, tip }
}
