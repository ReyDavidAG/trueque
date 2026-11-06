import { useEffect, useRef, useState } from 'react'

import { mountOrchardScene } from '@/components/wallet/orchardScene'
import type { OrchardTip, OrchardTree } from '@/types/orchardType'

export function useOrchardScene(trees: OrchardTree[]) {
	const host = useRef<HTMLDivElement>(null)
	const labels = useRef<(HTMLLIElement | null)[]>([])
	const [tip, setTip] = useState<OrchardTip | null>(null)

	useEffect(() => {
		const element = host.current
		if (!element || !trees.length) return
		return mountOrchardScene({
			host: element,
			trees,
			labels: labels.current,
			onTip: setTip,
		})
	}, [trees])

	const labelRef = (index: number) => (node: HTMLLIElement | null) => {
		labels.current[index] = node
	}

	return { host, labelRef, tip }
}
